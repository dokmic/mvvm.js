import { Model } from './model';
import {
  Callable,
  Commands,
  Commandable,
  Constructor,
  MethodOf,
  PropertyOf,
  RuntimeDecorator,
  isCallable,
  $evaluable,
} from '../reflectable';
import { $reference, getProperty, isReference } from '../property';
import { $observable } from '../observable';

/**
 * View-Model input default value property decorator handle.
 */
export type Defaults<T extends ViewModel = ViewModel> = RuntimeDecorator<T, [any]>;

/**
 * View-Model input default value property decorator.
 */
export type DefaultDecorator = {
  /**
   * Defines a default value for a View-Model input.
   * @param value - The default value.
   * @example
   * ```typescript
   * class SomeComponent extends Component {
   *   @Input @Default(true) active!: boolean;
   * }
   * ```
   */
  (value: unknown): <T extends ViewModel, K extends PropertyOf<T>>(type: T, property: K) => void;
};

/**
 * View-Model input property decorator handle.
 */
export type Inputs<T extends ViewModel = ViewModel> = RuntimeDecorator<T, [any]>;

/**
 * View-Model input property decorator.
 */
export type InputDecorator = {
  /**
   * Links the decorated View-Model property with a Model property.
   * @param property - The Model property name.
   * @example
   * class SomeComponent extends Component {
   *   Input('color') background!: string;
   * }
   */
  <M, K extends keyof M, VM extends ViewModel<{ [_ in keyof M]+?: M[K] }>>(property: keyof M): <
    T extends VM,
    P extends PropertyOf<T>
  >(
    type: T,
    property: P,
  ) => void;

  /**
   * Links the decorated View-Model property with the same Model property.
   * @example
   * class SomeComponent extends Component {
   *   Input color!: string;
   * }
   */
  <T extends ViewModel, K extends PropertyOf<T>>(type: T, property: K & keyof ModelOf<T>): void;
};

type ModelOf<T extends ViewModel> = T extends ViewModel<infer U> ? U : never;

/**
 * The View-Model encapsulating a Model.
 */
export interface ViewModel<T = any> {
  /**
   * The Model.
   */
  readonly props: T;
}

function link<T, U extends ViewModel<T>>(model: Model<T>, property: keyof typeof model, vm: U, target: keyof U): void {
  const reference = $reference(model, property);
  const value = model[property];
  if (isReference(value)) {
    Object.defineProperty(model, property, reference);
  }

  const observable = isCallable(value)
    ? $observable($evaluable(model as T, property)).call()
    : $observable(reference.object, reference.property);

  Object.defineProperty(reference.object, reference.property, observable);

  if (!getProperty(vm, target)) {
    Object.defineProperty(vm, target, reference);
  }
}

/**
 * Base View-Model implementation mixin.
 * The implementation handles input properties and command methods decorators.
 * @param commands - Command method decorator handle.
 * @param defaults - View-Model input default value property decorator handle.
 * @param inputs - View-Model input property decorator handle.
 */
export function ViewModelMixin(commands: Commands, defaults: Defaults, inputs: Inputs) {
  return <T extends Constructor<ViewModel & Commandable>>(Super: T) =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    class ViewModel<U> extends Super {
      /**
       * @param props - The Model.
       */
      constructor(props: Model<U>) {
        super(props);

        const values = defaults.getDecorated(this);
        Object.entries(inputs.getDecorated(this)).forEach(([target, [property = target]]) => {
          if (props[property as keyof U] === undefined && target in values) {
            // eslint-disable-next-line no-param-reassign
            [props[property as keyof U]] = values[target as keyof typeof values]!;
          }

          link(props, property as keyof U, this, target as keyof this);
        });

        Object.entries(commands.getDecorated(this))
          .filter(([property]) => !!props[property as keyof typeof props])
          .forEach(([property, [command = property]]) =>
            this.on(command as MethodOf<this>, props[property as keyof typeof props] as Callable),
          );
      }
    };
}
