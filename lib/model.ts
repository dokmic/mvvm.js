import { Observable, AbstractObservable } from './observable';
import { PropertyDecorator } from './provider';

export interface Model {}

/**
 * Basic Model Implementation
 */
export abstract class AbstractModel<TModel extends Model = Model>
  extends AbstractObservable implements Model {
    /**
     * @param model Default values
     */
    constructor(model: TModel = {} as TModel) {
      super();
      Object.assign(this, model);
      this.observe(this.constructor['mutable'] || []);
    }

    /**
     * Observe nested observable objecst
     * @param key The property name in the model
     * @param value The property value that might be observed
     */
    private observable(key: string, value: any) {
      if (AbstractObservable.isObservable(value)) {
        (value as Observable).addObserver(
          (subkey, value) => this.notify(key + '.' + subkey, value)
        );
      }

      return value;
    }

    /**
     * Observe mutable properties
     * @param keys Mutable keys
     */
    protected observe(keys: string[] = []) {
      keys.forEach(key => {
        let value = this.observable(key, this[key]);

        Object.defineProperty(this, key, {
          get: () => value,
          set: newValue => {
            if (value === newValue) {
              return;
            }

            value = this.observable(key, newValue);
            this.notify(key, value);
          }
        });
      });
    }
  }

/**
 * Mark property as mutable
 */
export let Mutable = PropertyDecorator.bind(null, 'mutable');
