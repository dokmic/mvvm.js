import { Evaluable } from '../reflectable';
import { Reference } from '../property';

type Referenceable<T> = T | Reference<any, any, T>;

/**
 * The Model containing input data. This is a data-source of View-Model.
 * Properties can refer to another object or a Model or can be functions invoked on demand.
 * If a function is using another model property, then the function will be invoked whenever the property change.
 */
export type Model<T> = {
  [K in keyof T]: Evaluable<T[K]> | Referenceable<T[K] extends Record<any, any> ? Model<T[K]> : T[K]>;
};
