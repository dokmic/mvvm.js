import { ExpressionImpl, Expression } from '../property';
import { ObservableExpressionMixin } from './expression';
import { Observable } from './observable';
import { Tracer } from './tracer';

describe('ObservableExpressionMixin', () => {
  let expression: jest.Mock;
  let observable: Expression<string> & Observable<string>;
  let tracer: jest.Mocked<Tracer<Observable<string>>>;

  beforeEach(() => {
    tracer = {
      start: jest.fn(),
      trace: jest.fn(),
      end: jest.fn(() => []),
    };
    expression = jest.fn();
    observable = new (ObservableExpressionMixin<string>(tracer)(ExpressionImpl))(expression, 'initial');
  });

  describe('call', () => {
    it('should call an expression within the active tracer', () => {
      observable.call();

      expect(tracer.start).toHaveBeenCalledBefore(expression);
      expect(tracer.end).toHaveBeenCalledAfter(expression);
    });

    it('should subscribe for traced observables', () => {
      const traced = ({ observe: jest.fn() } as unknown) as jest.Mocked<Observable<string>>;
      tracer.end.mockReturnValue([traced]);
      observable.call();

      expect(traced.observe).toHaveBeenCalled();
    });

    it('should not subscribe for itself', () => {
      spyOn(observable, 'observe');
      tracer.end.mockReturnValue([observable]);
      observable.call();

      expect(observable.observe).not.toHaveBeenCalled();
    });

    it('should call an expression on subscribe', () => {
      const traced = ({ observe: jest.fn() } as unknown) as jest.Mocked<Observable<string>>;
      traced.observe.mockReturnValueOnce(jest.fn());
      tracer.end.mockReturnValue([traced]);
      observable.call();

      const [[observer]] = traced.observe.mock.calls;
      expression.mockClear();
      observer('');

      expect(expression).toHaveBeenCalled();
    });

    it('should unsubscribe from previous subscriptions', () => {
      const unsubscribe = jest.fn();
      const traced = ({ observe: jest.fn(() => unsubscribe) } as unknown) as jest.Mocked<Observable<string>>;
      tracer.end.mockReturnValueOnce([traced]);
      observable.call();
      observable.call();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('should not notify observers if the return value has not changed', () => {
      expression.mockReturnValueOnce('initial');
      spyOn(observable, 'notify');

      observable.call();

      expect(observable.notify).not.toHaveBeenCalled();
    });

    it('should notify observers if the return value has changed', () => {
      expression.mockReturnValueOnce('something');
      spyOn(observable, 'notify');

      observable.call();

      expect(observable.notify).toHaveBeenCalledWith('something');
    });
  });
});
