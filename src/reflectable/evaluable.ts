import { Callable, isCallable, isObject } from './types';

type PlainObject = Record<string, unknown>;

/**
 * An object, which values can be expressed as functions.
 */
export type EvaluableObject<T extends PlainObject> = { [K in keyof T]: Evaluable<T[K]> };

/**
 * A value, which can be expressed as a function.
 */
export type Evaluable<T> = T | Callable<T> | (T extends PlainObject ? EvaluableObject<T> : never);

type EvaluatedValue<T> = T extends PlainObject ? EvaluatedObject<T> : T;

/**
 * An evaluable object with recursively evaluated values.
 */
export type EvaluatedObject<T extends PlainObject> = { [K in keyof T]: Evaluated<T[K]> };

/**
 * An evaluated value.
 */
export type Evaluated<T> = T extends Callable<infer U> ? EvaluatedValue<U> : EvaluatedValue<T>;

function evaluate<T extends Evaluable<any>>(value: T): Evaluated<T> | undefined {
  const evaluated = (isCallable(value) ? value() : value) as Evaluated<T>;

  if (!isObject(evaluated)) {
    return evaluated;
  }

  return Object.keys(evaluated).reduce(
    (result, key) =>
      Object.assign(result, {
        [key]: evaluate((evaluated as PlainObject)[key]),
      }),
    {} as Evaluated<T>,
  );
}

/**
 * Creates an evaluable expression for the object property.
 * @param object - The object.
 * @param property - The object property name.
 * @returns The function returning the evaluated property value.
 */
export function $evaluable<T>(object: T, property: keyof T): Callable<Evaluated<T[typeof property]> | undefined> {
  const value = object[property];

  return () => evaluate(value);
}
