import { mocked } from 'ts-jest/utils';
import { ContainerNode, Node } from './node';

describe('Node', () => {
  class TestNode extends Node<unknown> {}

  describe('constructor', () => {
    it('should append itself to a parent node', () => {
      const parent = new TestNode();
      spyOn(parent, 'append');

      const node = new TestNode(parent);
      expect(parent.append).toBeCalledWith(node);
    });
  });

  describe('append', () => {
    it('should append a child', () => {
      const parent = new TestNode();
      const node = new TestNode();
      parent.append(node);

      expect(parent.children).toContain(node);
    });

    it('should update a reference to the left sibling', () => {
      const parent = new TestNode();
      const node1 = new TestNode();
      const node2 = new TestNode();

      parent.append(node1);
      parent.append(node2);

      expect(node1.left).toBeUndefined();
      expect(node2.left).toBe(node1);
    });
  });

  describe('clean', () => {
    it('should remove children first', () => {
      const root = new TestNode();
      const a = new TestNode();
      const b = new TestNode();
      const c = new TestNode();
      const d = new TestNode();

      a.remove = jest.fn();
      b.remove = jest.fn();
      c.remove = jest.fn();
      d.remove = jest.fn();

      root.append(a);
      a.append(b);
      a.append(c);
      c.append(d);

      root.clean();

      expect(d.remove).toHaveBeenCalledBefore(mocked(c.remove));
      expect(c.remove).toHaveBeenCalledBefore(mocked(a.remove));
      expect(b.remove).toHaveBeenCalledBefore(mocked(a.remove));
      expect(a.remove).toHaveBeenCalled();
    });

    it('should unset tail', () => {
      const root = new TestNode();
      root.tail = new ContainerNode();
      root.clean();

      expect(root.tail).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove all references', () => {
      const container = new ContainerNode();
      const node = new TestNode(container);

      node.container = container;
      node.left = container;
      node.tail = container;
      node.remove();

      expect(node.container).toBeUndefined();
      expect(node.left).toBeUndefined();
      expect(node.parent).toBeUndefined();
      expect(node.tail).toBeUndefined();
    });
  });
});

describe('ContainerNode', () => {
  describe('constructor', () => {
    it('should refer to itself in the DOM', () => {
      const node = new ContainerNode();

      expect(node.container).toBe(node);
      expect(node.tail).toBe(node);
    });
  });

  describe('parentElement', () => {
    it('should get a parent element in the DOM', () => {
      const parent = new ContainerNode();
      const node = new ContainerNode(parent);

      parent.element = 'something';

      expect(node.parentElement).toBe('something');
      expect(parent.parentElement).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove a reference to a DOM element on removal', () => {
      const node = new ContainerNode();

      node.element = 'something';
      node.remove();

      expect(node.element).toBeUndefined();
    });
  });
});
