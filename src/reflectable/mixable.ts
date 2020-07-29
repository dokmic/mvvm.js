// eslint-disable-next-line import/no-extraneous-dependencies
import { Function, Tuple } from 'ts-toolbelt';
import { Callable } from './types';

function pipe<T, U>(inner: T, outer: Callable<U, [T]>): U {
  return outer(inner);
}

/**
 * Applies mixins to a constructor.
 * @param constructor - The target constructor.
 * @param mixins - The mixins to apply.
 * @returns The new constructor returned by the last mixin.
 */
export function mix<T, U extends Function.Piper<Tuple.Prepend<Callable[], Callable<any, [T]>>>>(
  constructor: T,
  ...mixins: U
): ReturnType<Function.Piped<U>> {
  return mixins.reduce(pipe, constructor) as ReturnType<Function.Piped<U>>;
}
