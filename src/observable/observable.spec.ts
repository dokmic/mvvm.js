import { ObservableMixin, isObservable } from './observable';
import * as Property from '../property';

jest.mock('../property');

describe('ObservableMixin', () => {
  class Observable extends ObservableMixin()(class {}) {}

  let observable: Observable;

  beforeEach(() => {
    observable = new Observable();
  });

  describe('notify', () => {
    it('should notify observers with parameters', () => {
      const observer1 = jest.fn();
      const observer2 = jest.fn();

      observable.observe(observer1);
      observable.observe(observer2);
      void observable.notify('something');

      expect(observer1).toHaveBeenCalledWith('something');
      expect(observer2).toHaveBeenCalledWith('something');
    });
  });

  describe('observe', () => {
    it('should observe an object', () => {
      const observer = jest.fn();

      observable.observe(observer);
      void observable.notify('something');

      expect(observer).toHaveBeenCalledWith('something');
    });

    it('should return unsubscribe function', () => {
      const observer = jest.fn();

      const unsubscribe = observable.observe(observer);
      unsubscribe();
      void observable.notify('something');

      expect(observer).not.toHaveBeenCalled();
    });
  });

  describe('unobserve', () => {
    it('should stop observing an object', () => {
      const observer = jest.fn();

      observable.observe(observer);
      observable.unobserve(observer);
      void observable.notify('something');

      expect(observer).not.toHaveBeenCalled();
    });
  });
});

describe('isObservable', () => {
  class Observable extends ObservableMixin()(class {}) {}

  it('should return true for an observable instance', () => {
    expect(isObservable(new Observable())).toBeTrue();
  });

  it('should return false for not an observable instance', () => {
    expect(isObservable({})).toBeFalse();
    expect(isObservable(undefined)).toBeFalse();
  });

  it('should return true for an observable property descriptor', () => {
    spyOn(Property, 'getProperty').and.returnValue(new Observable());
    const object = { something: null };

    expect(isObservable(object, 'something')).toBeTrue();
  });

  it('should return false for not an observable property descriptor', () => {
    const object = { something: null };

    expect(isObservable(object, 'something')).toBeFalse();
  });
});
