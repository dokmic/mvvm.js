type Resolver<Source, Destination> = (object: Source) => Destination;
type Instantiable<Type> = { new(...params: any[]): Type };
type Resolution<Source, Destination> = {
  source: Instantiable<Source>,
  resolver: Resolver<Source, Destination>
};

export interface Provider<Source, Destination> {
  /**
   * Register a rule
   * @param resolution Rule with a resolution
   */
  register(resolution: Resolution<Source, Destination>): this;

  /**
   * Resolve an instance from a source by registered rules
   * @param object
   */
  resolve(object: Source): Destination;
}

/**
 * Simple Instance Provider
 */
export class SimpleProvider< Source = any, Destination = any >
  implements Provider<Source, Destination> {
    protected resolutions: Array<Resolution<Source, Destination>> = [];

    /**
     * Find rule by source match
     * @param source Source class
     */
    protected find(source: Instantiable<Source>) {
      return this.resolutions.find(resolution => resolution.source === source);
    }

    register(resolution: Resolution<Source, Destination>) {
      if (!this.find(resolution.source)) {
        this.resolutions.push(resolution);
      }

      return this;
    }

    resolve(object: Source) {
      const resolution = this.find(Object.getPrototypeOf(object).constructor);

      return resolution ?
        resolution.resolver(object) :
        null;
    }
  }

type Cache<Source, Destination> = {
  source: Source,
  destination: Destination
};

/**
 * Caching Provider
 */
export class CachingProvider<Source = any, Destination = any>
  extends SimpleProvider<Source, Destination> {
    protected cache: Array<Cache<Source, Destination>> = [];

    resolve(object: Source) {
      const cache = this.cache.find(cache => cache.source === object);
      if (cache) {
        return cache.destination;
      }

      const result = super.resolve(object);
      if (result) {
        this.cache.push({ source: object, destination: result });
      }

      return result;
    }
  }

/**
 * Registers decorated class in the provider
 * @param provider Provider
 * @param source Decorated class
 */
export function ProvideDecorator<Source, Destination> (
  provider: Provider<Source, Destination>,
  source: Instantiable<Source>
) {
  return (destination: Instantiable<Destination>) => {
    provider.register({
      source,
      resolver: source => new destination(source),
    });

    return destination;
  };
}

/**
 * Stores property name in the constructor's property for the next access from the instance
 * @param name Constructor's property name
 * @param type Base class
 * @param property Property name to store
 */
export function PropertyDecorator<Type> (
  name: string,
  type: Instantiable<Type>,
  property: string
) {
  if (!type.constructor.hasOwnProperty(name)) {
    type.constructor[name] = []
      .concat(Object.getPrototypeOf(type).constructor[name] || []);
  }
  if (-1 === type.constructor[name].indexOf(property)) {
    type.constructor[name].push(property);
  }
}
