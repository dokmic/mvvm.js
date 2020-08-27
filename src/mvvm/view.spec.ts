import { Element, createElement } from '../jsx';
import { Bindings, ViewMixin } from './view';

describe('ViewMixin', () => {
  let element: Element<any, any>;
  const bindings = ({ getDecorated: jest.fn(() => ({})) } as unknown) as jest.Mocked<Bindings>;
  const binding = jest.fn();
  const render = jest.fn();

  class View extends ViewMixin(bindings)(
    class BaseView {
      binding = binding;

      render = render;
    },
  ) {}

  beforeEach(() => {
    jest.clearAllMocks();

    element = createElement('a', { style: {} });
    render.mockReturnValue(element);
  });

  describe('constructor', () => {
    it('should invoke a render method', () => {
      const view = new View();
      render.mockReturnValueOnce('something');

      expect(view.render()).toBe('something');
      expect(render).toHaveBeenCalled();
    });

    it('should assign a binding', () => {
      bindings.getDecorated.mockReturnValueOnce(({ binding: [] } as unknown) as ReturnType<
        typeof bindings.getDecorated
      >);
      new View().render();

      expect(element.props.binding).toBeFunction();
    });

    it('should assign a custom binding', () => {
      bindings.getDecorated.mockReturnValueOnce(({ binding: ['custom'] } as unknown) as ReturnType<
        typeof bindings.getDecorated
      >);
      new View().render();

      expect(element.props.custom).toBeFunction();
    });

    it('should assign a nested binding', () => {
      bindings.getDecorated.mockReturnValueOnce(({ binding: ['a.b'] } as unknown) as ReturnType<
        typeof bindings.getDecorated
      >);
      new View().render();

      expect(element.props.a).toEqual({ b: expect.any(Function) });
    });

    it('should pass a previously evaluated value', () => {
      bindings.getDecorated.mockReturnValueOnce(({ binding: ['style.fontStyle'] } as unknown) as ReturnType<
        typeof bindings.getDecorated
      >);
      binding.mockReturnValueOnce('a');
      binding.mockReturnValueOnce('b');

      new View().render();

      element.props.style.fontStyle();
      element.props.style.fontStyle();

      expect(binding).toHaveBeenCalledTimes(2);
      expect(binding).nthCalledWith(1, undefined);
      expect(binding).nthCalledWith(2, 'a');
    });
  });
});
