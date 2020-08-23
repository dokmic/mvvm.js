import { CommandableImpl, Command } from '../reflectable';

/**
 * Virtual DOM node.
 */
export abstract class Node<T> extends CommandableImpl {
  /**
   * Child nodes.
   */
  children: Node<T>[] = [];

  /**
   * First Virtual DOM present in the DOM node containing the current node.
   */
  container?: ContainerNode<T>;

  /**
   * Previous sibling node which is present in the DOM.
   */
  left?: Node<T>;

  /**
   * Last child of the current node which is present in the DOM.
   */
  tail?: ContainerNode<T>;

  /**
   * Initializes a Virtual DOM node and appends it to the parent.
   * @param parent - Parent Virtual DOM Node.
   */
  constructor(public parent?: Node<T>) {
    super();

    if (parent) {
      parent.append(this);
    }
  }

  /**
   * Append child node to the current node.
   * @param node - Child Virtual DOM node.
   */
  append(node: Node<T>): void {
    this.children.push(
      Object.assign(node, {
        left: this.children[this.children.length - 1],
      }),
    );
  }

  clean(): void {
    const queue = [...this.children.splice(0, this.children.length)];

    while (queue.length) {
      const tail = queue[queue.length - 1];
      if (tail.children.length) {
        queue.push(...tail.children.splice(0, tail.children.length));
      } else {
        queue.pop()!.remove();
      }
    }

    delete this.tail;
  }

  /**
   * Remove references to other nodes.
   */
  @Command remove(): void {
    delete this.parent;
    delete this.left;
    delete this.tail;
    delete this.container;
  }
}

/**
 * Virtual DOM node which is present in the DOM.
 */
export class ContainerNode<T> extends Node<T> {
  container = this;

  tail = this;

  /**
   * A DOM element corresponding to the current node.
   */
  element?: T;

  /**
   * First parent element in the DOM containing the current node.
   */
  get parentElement(): T | undefined {
    return this.parent?.container?.element;
  }

  /**
   * Previous sibling element in the DOM.
   */
  get previousSibling(): T | undefined {
    let { left } = this;
    while (left && !left.tail) {
      left = left.left;
    }

    return left?.tail?.element;
  }

  remove(): void {
    super.remove();

    delete this.element;
  }
}

/**
 * Virtual DOM node representing a plain text node.
 */
export class TextNode<T> extends ContainerNode<T> {}

/**
 * Virtual DOM node containing all renderable nodes.
 */
export class RootNode<T> extends ContainerNode<T> {
  /**
   * Initializes a Virtual DOM root node and stores related DOM element.
   * @param element - A DOM element that will contain all renderable nodes.
   */
  constructor(readonly element: T) {
    super();
  }
}

/**
 * Virtual DOM node which cannot be present in the DOM.
 */
export class ExpressionNode<T> extends Node<T> {
  /**
   * Initializes a Virtual DOM node and appends it to the parent.
   * @param parent - Parent Virtual DOM Node.
   */
  constructor(public parent: Node<T>) {
    super(parent);

    this.container = this.parent.container;
  }

  append(node: Node<T>): void {
    super.append(node);

    // eslint-disable-next-line no-param-reassign
    node.left = node.left ?? this.left;
  }
}
