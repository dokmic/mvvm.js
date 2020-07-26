/* eslint-disable @typescript-eslint/ban-types */

/**
 * A callable value or a function.
 */
export type Callable<T = any, U extends any[] = any[]> = (...args: U) => T;

/**
 * An object constructor.
 */
export interface Constructor<T = any, U extends any[] = any[]> {
  new (...args: U): T;
  prototype: T;
}

/**
 * Checks whether a value is a function.
 * @param value - The value to check.
 * @returns `true` if the value is callable.
 */
export function isCallable(value: unknown): value is Function {
  return !!(value && typeof value === 'function');
}
