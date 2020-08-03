/* eslint-disable @typescript-eslint/ban-types */

/**
 * A callable value or a function.
 */
export type Callable<T = any, U extends any[] = any[]> = (...args: U) => T;

/**
 * Function arguments.
 */
export type ArgumentsOf<T> = T extends Callable<unknown, infer U> ? U : never;

/**
 * Method of a class instance.
 */
export type MethodOf<T> = keyof Pick<T, { [K in keyof T]: T[K] extends Callable ? K : never }[keyof T]>;

/**
 * An object constructor.
 */
export interface Constructor<T = any, U extends any[] = any[]> {
  new (...args: U): T;
  prototype: T;
}

/**
 * An object prototype.
 */
export interface Prototype<T extends Function = Function> {
  constructor: T;
}

/**
 * Checks whether a value is a function.
 * @param value - The value to check.
 * @returns `true` if the value is callable.
 */
export function isCallable(value: unknown): value is Function {
  return !!(value && typeof value === 'function');
}

/**
 * Checks whether a value is not scalar.
 * @param value - The value to check.
 * @returns `true ` if the value is an object.
 */
export function isObject(value: unknown): value is Object {
  return !!(value && typeof value === 'object');
}

/**
 * Checks whether a value is an object prototype.
 * @param value - The value to check.
 * @returns `true` if the value is a prototype.
 */
export function isPrototype(value: unknown): value is Prototype {
  return !!(value && Object.prototype.hasOwnProperty.call(value, 'constructor'));
}
