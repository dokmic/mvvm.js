import { Decorator, RuntimeDecorator } from './decoratable';

describe('Decorator', () => {
  const decorate = jest.fn();
  const decorator = new (class TestDecorator extends Decorator<any, [string]> {
    decorate = decorate;
  })().getDecorator();

  beforeEach(() => {
    decorate.mockClear();
  });

  describe('getDecorator', () => {
    it('should decorate without parameters', () => {
      class TestClass {
        @decorator something?: number;
      }

      expect(decorate).toHaveBeenCalledWith(TestClass.prototype, 'something');
    });

    it('should pass decorator parameters', () => {
      class TestClass {
        @decorator('value') something?: number;
      }

      expect(decorate).toHaveBeenCalledWith(TestClass.prototype, 'something', 'value');
    });
  });
});

describe('RuntimeDecorator', () => {
  const decorator = new RuntimeDecorator<any, [string?]>('something');
  const decorate = decorator.getDecorator();

  describe('getDecorated', () => {
    it('should get decorated properties without parameters', () => {
      class TestClass {
        @decorate something?: number;
      }
      const instance = new TestClass();

      expect(decorator.getDecorated(instance)).toEqual({ something: [] });
    });

    it('should get decorated properties with parameters', () => {
      class TestClass {
        @decorate('value') something?: number;
      }
      const instance = new TestClass();

      expect(decorator.getDecorated(instance)).toEqual({ something: ['value'] });
    });

    it('should inherit decorated properties from a base class', () => {
      class BaseClass {
        @decorate('value1') something1?: number;

        @decorate('value0') something2?: number;
      }
      class TestClass extends BaseClass {
        @decorate('value2') something2?: number;

        @decorate('value3') something3?: number;
      }

      const instance = new TestClass();

      expect(decorator.getDecorated(instance)).toEqual({
        something1: ['value1'],
        something2: ['value2'],
        something3: ['value3'],
      });
    });
  });
});
