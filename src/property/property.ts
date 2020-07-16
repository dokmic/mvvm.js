/**
 * Property descriptor.
 */
export interface Property<T = unknown> extends TypedPropertyDescriptor<T | undefined> {
  get(): T | undefined;
  set(value?: T): void;
  value?: T;
}

interface Accessor {
  property?: Property;
}

function setPropertyInstance<T>(accessor: T, property: Property): T & Accessor {
  return Object.assign(accessor, { property });
}

function getPropertyInstance(value: any): TypedPropertyDescriptor<any> | undefined {
  return value?.property;
}

// eslint-disable-next-line consistent-return
export function getDescriptor<T, K extends keyof T>(object: T, property: K): TypedPropertyDescriptor<T[K]> | undefined {
  for (let item = object; item; item = Object.getPrototypeOf(item)) {
    const descriptor = Object.getOwnPropertyDescriptor(item, property);

    if (descriptor) {
      return (descriptor.get ?? descriptor.set) && descriptor;
    }
  }
}

/**
 * Tries to gather an original property descriptor object.
 * @param object - A source object.
 * @param property - The property name.
 * @returns The property descriptor if found or `undefined` otherwise.
 */
export function getProperty<T, K extends keyof T>(object: T, property: K): TypedPropertyDescriptor<T[K]> | undefined {
  const descriptor = getDescriptor(object, property);

  return getPropertyInstance(descriptor?.get) ?? getPropertyInstance(descriptor?.set) ?? descriptor;
}

/**
 * Property descriptor implementation.
 */
export class PropertyImpl<T> implements Property<T> {
  enumerable = true;

  configurable = true;

  /**
   * Initializes a property descriptor instance with an initial value.
   * @param stored - The inital value.
   */
  constructor(protected stored?: T) {
    this.get = setPropertyInstance(this.get.bind(this), this);
    this.set = setPropertyInstance(this.set.bind(this), this);
  }

  get(): T | undefined {
    return this.stored;
  }

  set(value: T): void {
    this.stored = value;
  }
}
