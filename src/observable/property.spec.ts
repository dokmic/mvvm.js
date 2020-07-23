import { PropertyImpl, Property } from '../property';
import { ObservablePropertyMixin } from './property';
import { Observable } from './observable';

describe('ObservablePropertyMixin', () => {
  let observable: Property & Observable;

  beforeEach(() => {
    observable = new (ObservablePropertyMixin()(PropertyImpl))('initial');
  });

  describe('get', () => {
    it('should assign a value', () => {
      observable.set('value');

      expect(observable.get()).toBe('value');
    });

    it('should not notify observers if the value has not changed', () => {
      spyOn(observable, 'notify');
      observable.set('initial');

      expect(observable.notify).not.toHaveBeenCalled();
    });

    it('should notify observers if the value has changed', () => {
      spyOn(observable, 'notify');
      observable.set('value');

      expect(observable.notify).toHaveBeenCalledWith('value');
    });

    it('should subscribe for an observable value', () => {
      const value = new (ObservablePropertyMixin()(PropertyImpl))();
      observable.set(value);
      spyOn(observable, 'notify');
      value.notify();

      expect(observable.notify).toHaveBeenCalledWith(value);
    });

    it('should unsubscribe from a previous observable value', () => {
      const unsubscribe = jest.fn();
      const value = new (ObservablePropertyMixin()(PropertyImpl))();

      spyOn(value, 'observe').and.returnValue(unsubscribe);
      observable.set(value);
      observable.set('something');

      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
