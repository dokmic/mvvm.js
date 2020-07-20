import { ReferenceImpl, isReference, resolve, $reference } from './reference';

describe('ReferenceImpl', () => {
  describe('get', () => {
    it('should get a source object property', () => {
      const object = { something: 'value' };
      const reference = new ReferenceImpl(object, 'something');

      expect(reference.get()).toBe('value');
    });
  });

  describe('set', () => {
    it('should update a source object property', () => {
      const object = { something: 'value' };
      const reference = new ReferenceImpl(object, 'something');
      reference.set('new value');

      expect(object.something).toBe('new value');
    });
  });
});

describe('isReference', () => {
  const reference = new ReferenceImpl({ something: 'value' }, 'something');

  it('should return true for a reference instance', () => {
    expect(isReference(reference)).toBeTrue();
  });

  it('should return true for a referencing property', () => {
    const object: { something?: string } = {};
    Object.defineProperty(object, 'something', reference);

    expect(isReference(object, 'something')).toBeTrue();
  });

  it('should return true for a reference in property value', () => {
    expect(isReference({ reference }, 'reference')).toBeTrue();
  });

  it('should return false for not a reference instance', () => {
    expect(isReference({})).toBeFalse();
    expect(isReference(undefined)).toBeFalse();
  });

  it('should return false for not defined property', () => {
    const object: { something?: string } = {};

    expect(isReference(object, 'something')).toBeFalse();
  });
});

describe('resolve', () => {
  const reference = new ReferenceImpl({ something: 'value' }, 'something');

  it('should resolve reference by the value', () => {
    expect(resolve(reference)).toBe(reference);
  });

  it('should return undefined if the value is not a reference', () => {
    expect(resolve('something')).toBeUndefined();
  });

  it('should resolve reference by the descriptor', () => {
    const object: { something?: string } = {};
    Object.defineProperty(object, 'something', reference);

    expect(resolve(object, 'something')).toBe(reference);
  });

  it('should resolve reference by the property value', () => {
    const object = { something: reference };

    expect(resolve(object, 'something')).toBe(reference);
  });

  it('should return undefined if the property is not a reference', () => {
    const object = { something: 'value' };

    expect(resolve(object, 'something')).toBeUndefined();
  });
});

describe('$reference', () => {
  it('should return resolved object property reference', () => {
    const reference = new ReferenceImpl({ something: 'value' }, 'something');
    const object: { something?: string } = {};
    Object.defineProperty(object, 'something', reference);

    expect($reference(object, 'something')).toBe(reference);
  });

  it('should create a reference for the object property', () => {
    const object = { something: 'value' };
    const reference = $reference(object, 'something');

    expect(reference).toBeInstanceOf(ReferenceImpl);
    expect(reference.get()).toBe('value');
  });
});
