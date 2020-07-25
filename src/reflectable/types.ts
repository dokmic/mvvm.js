/**
 * An object constructor.
 */
export interface Constructor<T = any, U extends any[] = any[]> {
  new (...args: U): T;
  prototype: T;
}
