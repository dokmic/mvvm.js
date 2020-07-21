import { Callable, Constructor } from '../reflectable';
import { getProperty } from '../property';

const OBSERVERS = Symbol('observers');

/**
 * Observer.
 */
export type Observer<T> = Callable<unknown, [T]>;

/**
 * Observable object.
 */
export interface Observable<T = unknown> {
  /**
   * Calls the registered observers.
   * @param value - The updated value.
   */
  notify(value?: T): void;

  /**
   * Adds an observer.
   * @param observer - The observer.
   * @returns The unsubscribe function.
   */
  observe(observer: Observer<T>): Callable<void, []>;

  /**
   * Removes an observer.
   * @param observer - The observer.
   */
  unobserve(observer: Observer<T>): void;
}

/**
 * Checks whether a value is an observable object.
 * @param value - The value.
 * @returns `true` if the value is an observable object.
 */
export function isObservable(value: unknown): value is Observable;

/**
 * Checks whether an object property is observable.
 * @param object - The object.
 * @param property - The property name.
 * @returns `true` if the property is observable.
 */
export function isObservable<T>(object: T, property: keyof T): boolean;

export function isObservable(...args: any[]): boolean {
  const [value, property] = args;
  if (args.length === 1) {
    return !!(value && value.observe && value.unobserve && value.notify);
  }

  return isObservable(getProperty(value, property));
}

/**
 * Base observable implementation mixin.
 */
export function ObservableMixin<U>() {
  return <T extends Constructor>(Super: T) =>
    class ObservableObject extends Super implements Observable<U> {
      /**
       * @todo should be private
       * @see https://github.com/Microsoft/TypeScript/issues/17293
       */
      /* private */ [OBSERVERS] = new Set<Observer<U>>();

      async notify(value: U): Promise<void> {
        Array.from(this[OBSERVERS].entries()).forEach(([observer]) => observer.call(observer, value));
      }

      observe(observer: Observer<U>): Callable<void> {
        this[OBSERVERS].add(observer);
        return this.unobserve.bind(this, observer);
      }

      unobserve(observer: Observer<U>): void {
        this[OBSERVERS].delete(observer);
      }
    };
}
