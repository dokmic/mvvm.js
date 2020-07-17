import { Callable } from '../reflectable';
import { PropertyImpl, Property } from './property';

/**
 * Dynamic property.
 */
export interface Expression<T = unknown> extends Property<T> {
  /**
   * An expression used to evaluate property value.
   */
  readonly expression: Callable<T, [T?]>;

  /**
   * Invokes the expression.
   */
  call(): this;
}

/**
 * Dynamic property implementation.
 */
export class ExpressionImpl<T> extends PropertyImpl<T> {
  /**
   * @param expression - An expression used to evaluate property value.
   * @param initial - An initial value of the property.
   */
  constructor(readonly expression: Callable<T, [T?]>, initial?: T) {
    super(initial);
  }

  call(): this {
    super.set(this.expression(super.get()));

    return this;
  }

  set(): void {
    //
  }
}
