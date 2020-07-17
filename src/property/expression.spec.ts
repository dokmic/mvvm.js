import { ExpressionImpl, Expression } from './expression';

describe('ExpressionImpl', () => {
  const expression = jest.fn();
  let property: Expression<string>;

  beforeEach(() => {
    expression.mockClear();
    property = new ExpressionImpl(expression, 'initial');
  });

  describe('call', () => {
    it('should call expression with an initial value', () => {
      property.call();

      expect(expression).toHaveBeenCalledWith('initial');
    });

    it('should call expression with a previous value', () => {
      expression.mockReturnValueOnce('previous');
      property.call();
      property.call();

      expect(expression).toHaveBeenNthCalledWith(1, 'initial');
      expect(expression).toHaveBeenNthCalledWith(2, 'previous');
    });

    it('should store most recent call result', () => {
      expression.mockReturnValueOnce('something');
      property.call();

      expect(property.get()).toBe('something');
    });

    it('should implement a fluent interface', () => {
      expect(property.call()).toBe(property);
    });
  });

  describe('set', () => {
    it('should not be assignable', () => {
      property.set();

      expect(property.get()).toBe('initial');
    });
  });
});
