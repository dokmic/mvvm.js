import { PropertyImpl, Property, getDescriptor, getProperty } from './property';

describe('getDescriptor', () => {
  it('should get a descriptor from the prototype', () => {
    const object = new (class {
      something?: number;
    })();
    const get = jest.fn();
    Object.defineProperty(Object.getPrototypeOf(object), 'something', { get });

    expect(getDescriptor(object, 'something')).toMatchObject({ get });
  });

  it('should return undefined when there is no property', () => {
    const object: { something?: number } = {};

    expect(getDescriptor(object, 'something')).toBeUndefined();
  });

  it('should return undefined when there are no accessors', () => {
    const object = { something: 1 };

    expect(getDescriptor(object, 'something')).toBeUndefined();
  });

  it('should return a descriptor when the getter is defined', () => {
    const object = {
      get something() {
        return 1;
      },
    };

    expect(getDescriptor(object, 'something')).toContainKey('get');
  });

  it('should return a descriptor when the setter is defined', () => {
    const object = {
      set something(value: number) {
        //
      },
    };

    expect(getDescriptor(object, 'something')).toContainKey('set');
  });
});

describe('getProperty', () => {
  it('should get an original property descriptor instance', () => {
    const property = new (class extends PropertyImpl<number> {})();
    const object: { something?: number } = {};
    Object.defineProperty(object, 'something', property);

    expect(getProperty(object, 'something')).toBe(property);
  });

  it('should return undefined when there is no property', () => {
    const object: { something?: number } = {};

    expect(getProperty(object, 'something')).toBeUndefined();
  });

  it('should return an actual property descriptor as a fallback', () => {
    const object = new (class {
      get something(): number {
        return 1;
      }
    })();

    expect(getProperty(object, 'something')).toMatchObject({
      get: expect.any(Function),
      set: undefined,
    });
  });
});

describe('PropertyImpl', () => {
  let property: Property<number>;

  beforeEach(() => {
    property = new PropertyImpl(1);
  });

  describe('constructor', () => {
    it('should assign itself to the get method', () => {
      expect(property.get).toContainEntry(['property', property]);
    });

    it('should assign itself to the set method', () => {
      expect(property.set).toContainEntry(['property', property]);
    });
  });

  describe('get', () => {
    it('should return a stored value', () => {
      expect(property.get()).toBe(1);
    });
  });

  describe('set', () => {
    it('should update a stored value', () => {
      property.set(2);

      expect(property.get()).toBe(2);
    });
  });
});
