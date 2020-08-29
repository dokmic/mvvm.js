import { BindDecorator, ViewMixin, View } from './view';
import { CommandableMixin, Commandable, Constructor, RuntimeDecorator, commands, mix } from '../reflectable';
import { DefaultDecorator, InputDecorator, ViewModelMixin, ViewModel } from './view-model';
import { Children, ClassComponent, Elements } from '../jsx';

/**
 * View attribute reactive binding method decorator handle.
 */
export const bindings = new RuntimeDecorator('bind');

/**
 * View attribute reactive binding method decorator.
 */
export const Bind = bindings.getDecorator() as BindDecorator;

/**
 * View-Model input default value property decorator handle.
 */
export const defaults = new RuntimeDecorator('default');

/**
 * View-Model input default value property decorator.
 */
export const Default = defaults.getDecorator() as DefaultDecorator;

/**
 * View-Model input property decorator handle.
 */
export const inputs = new RuntimeDecorator('input');

/**
 * View-Model input property decorator.
 */
export const Input = inputs.getDecorator() as InputDecorator;

/**
 * Base component class combining View and View-Model.
 * @
 */
export abstract class Component<T>
  extends mix(
    ClassComponent as Constructor<ClassComponent>,
    ViewMixin(bindings),
    CommandableMixin(commands),
    ViewModelMixin(commands, defaults, inputs),
  )<T>
  implements Commandable, ViewModel<T>, View<Elements> {
  /**
   * Component properties.
   * This is the Model that is used by View-Model.
   */
  readonly props!: T;

  /**
   * Renders the component node.
   * This method will be called upon the Model change.
   * @returns Rendered elements.
   */
  abstract render(): Children;
}
