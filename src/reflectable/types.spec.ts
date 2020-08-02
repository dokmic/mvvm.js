import { isCallable, isObject, isPrototype } from './types';

describe('isCallable', () => {
  it('should return true for a function value', () => {
    expect(isCallable(() => undefined)).toBeTrue();
    expect(
      isCallable(function something() {
        return undefined;
      }),
    ).toBeTrue();
    expect(isCallable(jest.fn())).toBeTrue();
  });

  it('should return false for an empty value', () => {
    expect(isCallable(undefined)).toBeFalse();
    expect(isCallable(null)).toBeFalse();
  });

  it('should return false for not a function value', () => {
    expect(isCallable({})).toBeFalse();
    expect(isCallable(1)).toBeFalse();
  });
});

describe('isObject', () => {
  it('should return true for an object value', () => {
    expect(isObject({})).toBeTrue();
    expect(isObject(new (class {})())).toBeTrue();
  });

  it('should return false for an empty value', () => {
    expect(isObject(undefined)).toBeFalse();
    expect(isObject(null)).toBeFalse();
  });

  it('should return false for not an object value', () => {
    expect(isObject(1)).toBeFalse();
    expect(isObject('value')).toBeFalse();
  });
});

describe('isPrototype', () => {
  it('should return true for a prototype value', () => {
    expect(isPrototype(class {}.prototype)).toBeTrue();
    expect(isPrototype(Function.prototype)).toBeTrue();
  });

  it('should return false for an empty value', () => {
    expect(isPrototype(undefined)).toBeFalse();
    expect(isPrototype(null)).toBeFalse();
  });

  it('should return false for not a prototype value', () => {
    expect(isPrototype(class {})).toBeFalse();
    expect(isPrototype(Function)).toBeFalse();
    expect(isPrototype('value')).toBeFalse();
  });
});
