import { PropertyImpl, Property, getDescriptor } from './property';

/**
 * Proxying property.
 */
export type Proxy<T> = Property<T>;

/**
 * Base proxying property implementation.
 * The implementation wraps an object property descriptor inside proxying property.
 * If that was a regular property then the value will be encapsualted.
 */
export class ProxyImpl<T, K extends keyof T> extends PropertyImpl<T[K]> implements Proxy<T[K]> {
  protected parent?: PropertyDescriptor;

  /**
   * @param object - The original object.
   * @param property - The property name.
   */
  constructor(protected object: T, protected property: K) {
    super();
    this.parent = getDescriptor(object, property);

    if (this.parent?.configurable != null) {
      this.configurable = this.parent.configurable;
    }
    if (this.parent?.enumerable != null) {
      this.enumerable = this.parent.enumerable;
    }
    if (!this.parent && Object.prototype.hasOwnProperty.call(object, property)) {
      super.set(object[property]);
    }
  }

  get(): T[K] | undefined {
    if (this.parent) {
      return this.parent.get?.();
    }

    return super.get();
  }

  set(value: T[K]): void {
    if (this.parent) {
      return void this.parent.set?.(value);
    }

    super.set(value);
  }
}
