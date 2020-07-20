import { PropertyImpl, Property, getProperty } from './property';

/**
 * Referring property.
 */
export interface Reference<T = unknown, K extends keyof T = keyof T, U extends T[K] = T[K]> extends Property<U> {
  readonly object: T;
  readonly property: K;
}

/**
 * Base referring property implementation.
 * The implementation returns and updates the referenced property value.
 */
export class ReferenceImpl<T = unknown, K extends keyof T = keyof T, U extends T[K] = T[K]>
  extends PropertyImpl<T[K]>
  implements Reference<T, K, U> {
  /**
   * @param object - The referenced object.
   * @param property - The referenced property name.
   */
  constructor(readonly object: T, readonly property: K) {
    super();
  }

  get(): U | undefined {
    return this.object[this.property] as U | undefined;
  }

  set(value: U): void {
    this.object[this.property] = value;
  }
}

/**
 * Checks whether a value is a referring property.
 * @param value - The value to check.
 * @returns `true` if the value is a referring property.
 */
export function isReference(value: unknown): value is Reference;

/**
 * Checks whether an object property is a reference.
 * @param object - The source object.
 * @param property - The property name.
 * @returns `true` if the object property is a reference.
 */
export function isReference<T>(object: T, property: keyof T): boolean;

export function isReference(...args: [unknown] | [any, keyof any]): boolean {
  if (args.length === 1) {
    return args[0] instanceof ReferenceImpl;
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return !!resolve(...args);
}

/**
 * Resolves a value if it is a reference.
 * @param value - The value to resolve.
 * @returns The value or `undefined` if the value is not a reference.
 */
export function resolve<T>(value: T): Reference<any, any, T> | undefined;

/**
 * Resolves an object property if it is a reference.
 * @param object - The object to resolve.
 * @param property - The property name to resolve.
 * @returns A reference or `undefined` if this is not a referring property.
 */
export function resolve<T, K extends keyof T>(object: T, property: K): Reference<T, K> | undefined;

// eslint-disable-next-line consistent-return
export function resolve(...args: [unknown] | [any, keyof any]): Reference | undefined {
  if (args.length === 1) {
    return isReference(args[0]) ? args[0] : void 0;
  }

  const [object, property] = args;
  const descriptor = getProperty(object, property);

  if (isReference(descriptor)) {
    return descriptor;
  }

  if (isReference(object[property])) {
    return object[property];
  }
}

/**
 * Creates a reference for an object property.
 * @param object - The target object.
 * @param property - The target property name.
 * @returns The referring property.
 */
export function $reference<T, K extends keyof T>(object: T, property: K): Reference<T, K> {
  return resolve(object, property) ?? new ReferenceImpl(object, property);
}
