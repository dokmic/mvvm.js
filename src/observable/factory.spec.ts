import { Constructor } from '../reflectable';
import { ObservableFactory } from './factory';
import * as Observable from './observable';
import * as Property from '../property';

jest.mock('../property');

describe('ObservableFactory', () => {
  let ExpressionImpl: Constructor<Property.Expression & Observable.Observable>;
  let PropertyImpl: Constructor<Property.Property & Observable.Observable>;
  let factory: ObservableFactory;

  beforeEach(() => {
    ExpressionImpl = jest.fn();
    PropertyImpl = jest.fn();
    factory = new ObservableFactory(PropertyImpl as any, ExpressionImpl as any);
  });

  it('should return an observable expression as-is', () => {
    const expression = jest.fn();
    spyOn(Observable, 'isObservable').and.returnValue(true);

    expect(factory.make(expression)).toBe(expression);
  });

  it('should create an observable expression', () => {
    const expression = jest.fn();
    spyOn(Observable, 'isObservable').and.returnValue(false);

    expect(factory.make(expression)).toBeInstanceOf(ExpressionImpl);
  });

  it('should return an observable descriptor as-is', () => {
    const object = { something: 'value' };
    const property = {};
    spyOn(Property, 'getProperty').and.returnValue(property);
    spyOn(Observable, 'isObservable').and.returnValue(true);

    expect(factory.make(object, 'something')).toBe(property);
    expect(Property.getProperty).toHaveBeenCalledWith(object, 'something');
    expect(Observable.isObservable).toHaveBeenCalledWith(property);
  });

  it('should return an observable property value as-is', () => {
    const property = {};
    const object = { property };

    spyOn(Observable, 'isObservable').and.callFake((value) => value === property);

    expect(factory.make(object, 'property')).toBe(property);
    expect(Observable.isObservable).toHaveBeenCalledWith(property);
  });

  it('should create an observable property', () => {
    spyOn(Observable, 'isObservable').and.returnValue(false);

    expect(factory.make({ something: 'value' }, 'something')).toBeInstanceOf(PropertyImpl);
  });

  it('should create observable properties recursively', () => {
    spyOn(Observable, 'isObservable').and.returnValue(false);

    const object = { a: { b: 'value' } };
    factory.make(object, 'a');

    expect(PropertyImpl).nthCalledWith(1, object.a, 'b');
    expect(PropertyImpl).nthCalledWith(2, object, 'a');
  });
});
