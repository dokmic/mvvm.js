import { $observable } from '../observable';
import { ContainerNode, ExpressionNode } from './node';
import { Renderer } from './renderer';
import { Tree } from './tree';
import { Children, ClassComponent, PropsWithChildren, createElement } from './element';

type Elements = { [type: string]: any };
type Type = keyof Elements;

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
declare namespace createElement {
  namespace JSX {
    interface IntrinsicElements extends Elements {}
    type Element = Children<Elements>;
  }
}
/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */

describe('Tree', () => {
  let renderer: Renderer<Type, Elements>;
  let tree: Tree<any, Elements>;
  let root: ContainerNode<Type>;

  beforeEach(() => {
    renderer = {
      createElement: jest.fn((type) => type),
      createText: jest.fn((type) => type),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      insertChild: jest.fn(),
      removeChild: jest.fn(),
    };
    tree = new Tree(renderer);
    root = new ContainerNode();
  });

  describe('render', () => {
    it('should build a tree structure', () => {
      tree.render(
        root,
        <a>
          <b>
            <c />
          </b>
          <c />
        </a>,
      );

      let children = root.children as ContainerNode<Type>[];
      expect(children.length).toBe(1);
      expect(children[0].element).toBe('a');

      children = children[0].children as ContainerNode<Type>[];
      expect(children.length).toBe(2);
      expect(children[0].element).toBe('b');
      expect(children[1].element).toBe('c');

      children = children[0].children as ContainerNode<Type>[];
      expect(children.length).toBe(1);
      expect(children[0].element).toBe('c');
    });

    it('should not render empty nodes', () => {
      tree.render(root, [null, undefined]);

      expect(root.children.length).toBe(0);
    });

    it('should flatten children', () => {
      tree.render(
        root,
        <a>
          {[<b />, [<c />]]}
          <d />
        </a>,
      );

      const children = root.children[0].children as ContainerNode<Type>[];

      expect(children.length).toBe(3);
      expect(children[0].element).toBe('b');
      expect(children[1].element).toBe('c');
      expect(children[2].element).toBe('d');
    });

    it('should set a tail on expression nodes', () => {
      tree.render(root, () => () => <a />);

      const container = root.children[0].children[0].children[0];

      expect(root.children[0].tail).toBe(container);
      expect(root.children[0].children[0].tail).toBe(container);
    });

    it('should clean root before render', () => {
      spyOn(root, 'clean');
      tree.render(root, <a />);

      expect(root.clean).toHaveBeenCalled();
    });

    it('should set a tail on parent nodes', () => {
      tree.render(root, () => [jest.fn(), () => <a />, jest.fn()]);

      const [expression1] = root.children;
      const [expression2, expression3] = expression1.children;

      tree.render(expression3, <b />);
      tree.render(expression2, <c />);

      expect(expression1.tail).toBeDefined();
      expect(expression1.tail!.element).toBe('b');
      expect(expression2.tail).toBeDefined();
      expect(expression2.tail!.element).toBe('c');
    });
  });

  describe('renderExpression', () => {
    let element: Children<Elements>;
    const expression = jest.fn(() => element);
    const observable = $observable(expression);

    beforeEach(() => {
      expression.mockClear();
      element = <a />;

      tree.render(root, () => observable.call().get());
    });

    it('should render an expression', () => {
      const [node] = root.children;
      const [child] = node.children as ContainerNode<Type>[];

      expect(node).toBeInstanceOf(ExpressionNode);
      expect(child.element).toBe('a');
    });

    it('should rerender on expression change', () => {
      element = <b />;
      observable.notify();

      const [node] = root.children;
      const [child] = node.children as ContainerNode<Type>[];

      expect(child.element).toBe('b');
    });

    it('should unsubscribe on rerendering', () => {
      tree.render(root, <c />);
      element = <b />;
      observable.notify();

      const [node] = root.children as ContainerNode<Type>[];

      expect(node.element).toBe('c');
    });
  });

  describe('renderText', () => {
    beforeEach(() => {
      tree.render(root, 'something');
    });

    it('should create a text node', () => {
      expect(renderer.createText).toHaveBeenCalledWith('something', root.element);
    });

    it('should remove text node on rerendering', () => {
      tree.render(root, 'anything');

      expect(renderer.removeChild).toHaveBeenCalledWith(root.element, 'something');
    });
  });

  describe('renderComponent', () => {
    it('should pass props to a component function', () => {
      const SomeComponent = jest.fn(({ children }: PropsWithChildren) => <a>{children}</a>);
      const props = { a: 'something' };
      tree.render(
        root,
        // eslint-disable-next-line react/jsx-props-no-spreading
        <SomeComponent {...props}>
          <b />
        </SomeComponent>,
      );

      expect(SomeComponent).toHaveBeenCalledWith({ ...props, children: [<b />] });
    });

    it('should render function component children', () => {
      const SomeComponent = ({ children }: PropsWithChildren) => <a>{children}</a>;
      tree.render(
        root,
        <SomeComponent>
          <b />
        </SomeComponent>,
      );

      const [a] = root.children as ContainerNode<Type>[];

      expect(a).toBeDefined();
      expect(a.element).toBe('a');

      const [b] = a.children as ContainerNode<Type>[];

      expect(b).toBeDefined();
      expect(b.element).toBe('b');
    });

    it('should render class component children', () => {
      class SomeComponent extends ClassComponent<any> {
        render() {
          return <a>{this.props.children}</a>;
        }
      }

      tree.render(
        root,
        <SomeComponent>
          <b />
        </SomeComponent>,
      );

      const [a] = root.children as ContainerNode<Type>[];

      expect(a).toBeDefined();
      expect(a.element).toBe('a');

      const [b] = a.children as ContainerNode<Type>[];

      expect(b).toBeDefined();
      expect(b.element).toBe('b');
    });
  });

  describe('renderNode', () => {
    beforeEach(() => {
      tree.render(
        root,
        <a>
          <b />
        </a>,
      );
    });

    it('should create elements', () => {
      expect(renderer.createElement).toHaveBeenCalledTimes(2);
      expect(renderer.createElement).nthCalledWith(1, 'a', root.element);
      expect(renderer.createElement).nthCalledWith(2, 'b', 'a');
    });

    it('should remove node on rerender', () => {
      tree.render(root, <c />);

      expect(renderer.removeChild).toHaveBeenCalledTimes(2);
      expect(renderer.removeChild).nthCalledWith(1, 'a', 'b');
      expect(renderer.removeChild).nthCalledWith(2, root.element, 'a');
    });
  });

  describe('setProperty', () => {
    it('should set an attribute', () => {
      tree.render(root, <a href="something" />);

      expect(renderer.setAttribute).toHaveBeenCalledWith('a', 'href', 'something');
    });

    it('should remove an attribute', () => {
      tree.render(root, <a href={null} />);

      expect(renderer.removeAttribute).toHaveBeenCalledWith('a', 'href');
    });

    it('should evaluate an expression', () => {
      tree.render(root, <a style={() => ({ b: 1, c: () => 2 })} />);

      expect(renderer.setAttribute).toHaveBeenCalledWith('a', 'style', { b: 1, c: 2 });
    });

    it('should update an attribute on expression change', () => {
      const observable = $observable((prev = 0) => prev + 1);

      tree.render(root, <a href={() => observable.call().get()} />);
      observable.notify();

      expect(renderer.setAttribute).toHaveBeenCalledTimes(2);
      expect(renderer.setAttribute).toHaveBeenCalledWith('a', 'href', 1);
      expect(renderer.setAttribute).toHaveBeenCalledWith('a', 'href', 2);
    });

    it('should stop updating an attribute on rerendering', () => {
      const observable = $observable((prev = 0) => prev + 1);

      tree.render(root, <a href={() => observable.call().get()} />);
      tree.render(root, <b />);
      observable.notify();

      expect(renderer.setAttribute).not.toHaveBeenCalledWith('a', 'href', 2);
    });
  });

  describe('setListener', () => {
    it('should add an event listener', () => {
      const listener = jest.fn();
      tree.render(root, <a onClick={listener} />);

      expect(renderer.addEventListener).toHaveBeenCalledWith('a', 'click', listener);
    });

    it('should remove an event listener on rerendering', () => {
      const listener = jest.fn();
      tree.render(root, <a onClick={listener} />);
      tree.render(root, <b />);

      expect(renderer.removeEventListener).toHaveBeenCalledWith('a', 'click', listener);
    });

    it('should update listener on props change', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const props = { onClick: listener1 };
      Object.defineProperty(props, 'onClick', $observable(props, 'onClick'));

      tree.render(root, createElement('a', props));
      props.onClick = listener2;

      expect(renderer.removeEventListener).toHaveBeenCalledWith('a', 'click', listener1);
      expect(renderer.addEventListener).toHaveBeenCalledWith('a', 'click', listener2);
    });
  });
});
