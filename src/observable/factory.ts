import { Callable, Constructor, isObject } from '../reflectable';
import { Expression, Property, getProperty } from '../property';
import { Observable, isObservable } from './observable';

/**
 * Observables factory.
 */
export class ObservableFactory {
  /**
   * @param PropertyConstructor - Observable property constructor.
   * @param ExpressionConstructor - Observable expression constructor.
   */
  constructor(
    private PropertyConstructor: Constructor<Property & Observable>,
    private ExpressionConstructor: Constructor<Expression & Observable>,
  ) {}

  /**
   * Creates an observable for an object property.
   * @param object - The target object.
   * @param property - The property name.
   * @returns The observable property.
   */
  make<T, K extends keyof T>(object: T, property: K): Property<T[K]> & Observable<T[K]>;

  /**
   * Creates an observable for an expression.
   * @param expression - The expression.
   * @returns The observable expression.
   */
  make<T, U extends any[]>(expression: Callable<T, U>): Expression<T> & Observable<T>;

  make<T>(...args: [Callable<T>] | [any, keyof T]): Observable<T> {
    if (args.length === 1) {
      return this.makeExpression(args[0]);
    }

    return this.makeProperty(args[0], args[1]);
  }

  protected makeExpression<T>(value: Callable<T> | Observable<T>): Expression<T> & Observable<T> {
    return (isObservable(value) ? (value as unknown) : new this.ExpressionConstructor(value)) as Expression<T> &
      Observable<T>;
  }

  protected makeProperty<T, K extends keyof T>(object: T, property: K): Property<T[K]> & Observable<T[K]> {
    const descriptor = getProperty(object, property);

    if (isObservable(descriptor)) {
      return descriptor as Property<T[K]> & Observable<T[K]>;
    }

    if (isObservable(object[property])) {
      return (object[property] as unknown) as Property<T[K]> & Observable<T[K]>;
    }

    if (isObject(object[property])) {
      Object.defineProperties(
        object[property],
        Object.fromEntries(
          Object.keys(object[property]).map((key) => [key, this.makeProperty(object[property], key as keyof T[K])]),
        ),
      );
    }

    return new this.PropertyConstructor(object, property) as Property<T[K]> & Observable<T[K]>;
  }
}
