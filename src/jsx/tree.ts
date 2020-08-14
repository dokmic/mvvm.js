import { ContainerNode, ExpressionNode, Node } from './node';
import { Child, Children, Elements, Void } from './element';
import { Renderer } from './renderer';

interface Branch<T, U extends Elements<U>> {
  node: Node<T>;
  children: Children<U>;
}

/**
 * Virtual DOM tree.
 */
export class Tree<T, U extends Elements<U>> {
  /**
   * Initializes a Virtual DOM tree.
   * @param renderer - DOM nodes renderer.
   */
  constructor(protected renderer: Renderer<T, U>) {}

  /**
   * Renders elements under a Virtual DOM root node.
   * @param root - The Virtual DOM node root.
   * @param elements - The elements to render.
   */
  render(root: Node<T>, elements: Children<U>): void {
    root.clean();

    const queue = [elements as Child<U>].flat(Infinity).map((child: Child<U>) => ({ child, node: root }));

    while (queue.length) {
      const { node: parent, child } = queue.shift()!;
      if (child == null) {
        continue;
      }

      const { node, children } = this.renderChild(parent, child);
      // eslint-disable-next-line @typescript-eslint/no-shadow
      queue.unshift(...[children as Child<U>].flat(Infinity).map((child: Child<U>) => ({ child, node })));

      if (node instanceof ContainerNode && node !== parent) {
        this.renderer.insertChild(node.parentElement, node.element, node.previousSibling);
        Tree.setTail(node, node.parent!, root.parent);
      }
    }

    Tree.syncTail(root.parent);
  }

  // eslint-disable-next-line consistent-return
  private static getTail<TElement>(node: Node<TElement>): ContainerNode<TElement> | undefined {
    for (let i = node.children.length - 1; i >= 0; i -= 1) {
      if (node.children[i].tail) {
        return node.children[i].tail;
      }
    }
  }

  private static setTail<TElement>(tail: ContainerNode<TElement>, from: Node<TElement>, to?: Node<TElement>): void {
    for (let item = from; item instanceof ExpressionNode && item !== to; item = item.parent) {
      item.tail = tail;
    }
  }

  private static syncTail<TElement>(node?: Node<TElement>): void {
    for (let item = node; item instanceof ExpressionNode; item = item.parent) {
      const tail = Tree.getTail(item);
      if (item.tail === tail) {
        break;
      }

      item.tail = tail;
    }
  }

  private renderChild(parent: Node<T>, child: Exclude<Child<U>, Void>): Branch<T, U> {
    throw new Error('Not implemented');
  }
}
