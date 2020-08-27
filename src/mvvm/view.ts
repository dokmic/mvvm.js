import { Callable, Constructor, MethodOf, RuntimeDecorator } from '../reflectable';
import { Children, Elements, Element } from '../jsx';

/**
 * View attribute reactive binding method decorator handle.
 */
export type Bindings<T extends View = View> = RuntimeDecorator<T, [string]>;

/**
 * View attribute reactive binding method decorator.
 */
export type BindDecorator = {
  /**
   * Binds the View attribute with the decorated method result.
   * @param property - The View property name.
   * @example
   * class SomeComponent extends Component {
   *   Bind('style.fontWeight') fontWeight(): boolean {
   *     return this.isActive ? 'bold' : 'normal';
   *   }
   * }
   */
  (property: string): <T extends View>(type: T, property: keyof T) => void;

  /**
   * Binds the View attribute with the same name as the decorated method.
   * @example
   * class SomeComponent extends Component {
   *   Bind style(): string {
   *     return 'font-weight: bold';
   *   }
   * }
   */
  <T extends View>(type: T, property: keyof T): void;
};

/**
 * The View representing a Model.
 * The View binds the Model properties accessible via a View-Model with a representation layer.
 */
export interface View<T extends Elements<T> = any> {
  /**
   * Renders the Model representation.
   */
  render(): Children<T>;
}

function get(object: Record<string, any>, path: string): unknown {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function set(object: Record<string, any>, path: string, value: unknown): void {
  const keys = path.split('.');
  const key = keys.pop()!;
  const target = keys.reduce((child, item) => {
    if (child[item] == null) {
      // eslint-disable-next-line no-param-reassign
      child[item] = {};
    }

    return child[item] as Record<string, any>;
  }, object);

  target[key] = value;
}

function binding<T>(expression: Callable<T, [T]>, initial: T): Callable<T> {
  let previous = initial;

  return () => {
    previous = expression(previous);

    return previous;
  };
}

/**
 * Base View implementation mixin.
 * The implementation handles binding method decorators by linking the evaluated values with properties within the representation.
 * @param bindings - View attribute reactive binding method decorator handle.
 */
export function ViewMixin(bindings: Bindings) {
  return <T extends Constructor<View>>(Super: T) =>
    class View extends Super {
      constructor(...args: any[]) {
        super(...args);

        const { render } = this;

        this.render = () => {
          const result = render.call(this);

          if (result instanceof Element) {
            Object.entries(bindings.getDecorated(this)).forEach(([method, [property = method] = []]) =>
              set(
                result.props,
                property,
                binding(
                  ((this[method as MethodOf<this>] as unknown) as Callable).bind(this),
                  get(result.props, property),
                ),
              ),
            );
          }

          return result;
        };
      }
    };
}
