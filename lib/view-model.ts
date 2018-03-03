import { AbstractModel } from './model';
import { PropertyDecorator } from './provider';

type Binding = (value: any) => void;
type Listener<TCommandableViewModel extends CommandableViewModel = CommandableViewModel> =
  (vm: TCommandableViewModel, ...params: any[]) => void;

export interface ViewModel {
  /**
   * Bind callback on property change
   * @param property The property that can be changed
   * @param callback The callback function
   */
  bind(property: string, callback: Binding): this;
}

/**
 * Basic View Model Implementation
 */
export abstract class AbstractViewModel<TAbstractModel extends AbstractModel = AbstractModel>
  implements ViewModel {
    private propagation = true;

    constructor(protected model: TAbstractModel) {
      model.addObserver(this.observer.bind(this));
      this.bindings();
    }

    /**
     * Model data observer
     * @param name Property name
     * @param value Updated value
     */
    protected observer(name: string, value: any) {
      if (this.propagation) {
        this[name] = value;
      }
    }

    /**
     * Bind properties with the model's ones
     */
    private bindings() {
      (this.constructor['bindable'] || []).forEach(
        (property: string) => Object.defineProperty(
          this,
          property, {
            get: () => this.model[property],
            set: value => this.model[property] = value,
            configurable: true,
          }
        )
      );
    }

    /**
     * Get inherited property descriptor
     * @param property Property name
     */
    private getDescriptor(property: string): PropertyDescriptor | null {
      let object = this,
        descriptor;

      do {
        descriptor = Object.getOwnPropertyDescriptor(object, property);
        object = Object.getPrototypeOf(object);

        if (descriptor) {
          return descriptor.get || descriptor.set
            ? descriptor
            : null;
        }
      } while (object);

      return null;
    }

    /**
     * Define property setter
     * @param property Property name
     * @param setter Setter callback
     */
    private define(property: string, setter: Binding) {
      let value = this[property];
      Object.defineProperty(this, property, {
        get: () => value,
        set: (newValue: any) => {
          value = newValue;
          setter(value);
        },
        configurable: true,
      });
    }

    /**
     * Set property descriptor cascade
     * @param property Property name
     * @param setter Setter callback
     * @param parent Parent's property descriptor
     */
    private cascade(property: string, setter: Binding, parent: PropertyDescriptor) {
      if (!delete this[property]) {
        return;
      }
      Object.defineProperty(this, property, {
        get: parent.get && parent.get.bind(this),
        set: (value: any) => {
          if (parent.set) {
            this.propagation = false;
            parent.set.call(this, value);
            this.propagation = true;
          }

          setter(value);
        },
        configurable: true,
      });
    }

    bind(property: string, callback: Binding) {
      const parent = this.getDescriptor(property);

      if (parent) {
        this.cascade(property, callback, parent);
      } else {
        this.define(property, callback);
      }

      callback(this[property]);

      return this;
    }
  }

export interface CommandableViewModel extends ViewModel {
  /**
   * Command listener
   * @param command Command name
   * @param callback Listener
   */
  on(command: string, callback: Listener<this>): this;
}

/**
 * Basic Interactive View Model Implementation
 */
export abstract class AbstractCommandableViewModel<TAbstractModel extends AbstractModel = AbstractModel>
  extends AbstractViewModel<TAbstractModel>
  implements CommandableViewModel {
    constructor(readonly model: TAbstractModel) {
      super(model);
      this.listening();
    }

    private listeners: {
      [command: string]: Listener[]
    } = {};

    /**
     * Wrap commands methods to work with listeners
     */
    private listening() {
      (this.constructor['commands'] || []).forEach(
        (property: string) => this[property] = (...params: any[]) => {
          const result = Object.getPrototypeOf(this)[property].apply(this, params);
          (this.listeners[property] || []).forEach(
            listener => listener.apply(this, [this].concat(params))
          );

          return result;
        }
      );
    }

    on(command: string, listener: Listener<this>) {
      if (!this.listeners[command]) {
        this.listeners[command] = [];
      }
      if (-1 === this.listeners[command].indexOf(listener)) {
        this.listeners[command].push(listener);
      }

      return this;
    }
  }

/**
 * Bind property to model
 */
export let Bindable = PropertyDecorator.bind(null, 'bindable');

/**
 * Mark method as a command
 */
export let Command = PropertyDecorator.bind(null, 'commands');
