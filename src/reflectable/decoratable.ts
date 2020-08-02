import { Prototype, isPrototype } from './types';

const DECORATORS = Symbol('decorators');

type Decorated<T, U extends unknown[]> = Partial<Record<keyof T, U>>;
type Decorators<T, U extends unknown[]> = Record<string, Decorated<T, U>>;

/**
 * Decoratable object.
 */
export interface Decoratable<T, U extends unknown[]> extends Function {
  /**
   * The decorators map.
   */
  [DECORATORS]?: Decorators<T, U>;
}

type Type<T, U extends unknown[]> = T & Prototype<Decoratable<T, U>>;
type PropertyDecorator<T, U extends unknown[] = unknown[]> = (type: Type<T, U>, property: keyof T) => void;

/**
 * Base decorator handle implementation.
 * The implementation constructs a parameterized decorator.
 */
export abstract class Decorator<Class, U extends unknown[]> {
  /**
   * @returns The decorator function.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getDecorator() {
    return this.decorator.bind(this);
  }

  private decorator<T extends Class>(type: Type<T, U>, property: keyof T): void;

  private decorator<T extends Class>(...parameters: U): PropertyDecorator<T, U>;

  private decorator<T extends Class>(...args: unknown[]): void | PropertyDecorator<T, U> {
    const [type, property] = args as [Type<Class, U>, keyof Class];
    if (!isPrototype(type)) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      return <T extends Class, K extends keyof T>(type: Type<T, U>, property: K) =>
        this.decorate(type, property, ...(args as U));
    }

    return this.decorate(type, property);
  }

  /**
   * The decorator callback.
   * @param type - The decorated type or class.
   * @param property - The decorated property or method name.
   * @param params - The decorator parameters.
   */
  protected abstract decorate<T extends Class>(type: Type<T, U>, property: keyof T, ...params: U | []): void;
}

/**
 * Runtime decorator implementation.
 * The implementation stores all the decorated properties and their parameters in the type constructor
 * so data can be extracted after the instantiation.
 */
export class RuntimeDecorator<Class, U extends unknown[]> extends Decorator<Class, U> {
  /**
   * @param key - Unique decorator identifier.
   */
  constructor(protected key: string) {
    super();
  }

  protected decorate<T extends Class>(type: Type<T, U>, property: keyof T, ...params: U): void {
    const { constructor } = type;

    if (!Object.prototype.hasOwnProperty.call(constructor, DECORATORS)) {
      constructor[DECORATORS] = {};
    }

    if (!constructor[DECORATORS]![this.key]) {
      constructor[DECORATORS]![this.key] = {};
    }

    constructor[DECORATORS]![this.key][property] = params;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }

  /**
   * Gets all the decorated properties and their parameters.
   * It merges all the properties by following the prototype chain.
   * @param instance - A decorated class instance.
   * @returns An object with decorated properties as keys and their parameters in values.
   */
  getDecorated(instance: Type<Class, U>): Required<Decorated<Class, U>> {
    let decorated = {} as Decorated<Class, U>;

    for (let prototype = instance; prototype; prototype = Object.getPrototypeOf(prototype)) {
      decorated = {
        ...prototype.constructor[DECORATORS]?.[this.key],
        ...decorated,
      };
    }

    return decorated as Required<typeof decorated>;
  }
}
