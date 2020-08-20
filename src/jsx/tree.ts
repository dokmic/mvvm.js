import { Evaluated, isCallable, $evaluable, Callable } from '../reflectable';
import { $observable } from '../observable';
import { ContainerNode, ExpressionNode, Node, TextNode } from './node';
import {
  Child,
  Children,
  ComponentType,
  ElementType,
  Element,
  Elements,
  Expression,
  Type,
  Void,
  isClassComponent,
  PropsOf,
} from './element';
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
    if (child instanceof Element) {
      return this.renderElement(parent, child);
    }

    if (isCallable(child)) {
      return this.renderExpression(parent, child);
    }

    return this.renderText(parent, child);
  }

  private renderElement(parent: Node<T>, element: Element<U, Type<U>>): Branch<T, U> {
    if (isCallable(element.type)) {
      return this.renderComponent(parent, element.type, element.props);
    }

    return this.renderNode(parent, element.type, element.props as PropsOf<keyof U, U>);
  }

  /**
   * Renders an expression node.
   * @param parent - Parent Virtual DOM node.
   * @param expression - The expression to evaluate and render.
   */
  protected renderExpression(parent: Node<T>, expression: Expression<U>): Branch<T, U> {
    const node = new ExpressionNode(parent);
    const observable = $observable(expression);
    const children = observable.call().get();

    const unsubscribe = observable.observe((elements) => this.render(node, elements));
    node.once('remove', unsubscribe, true);

    return { node, children };
  }

  /**
   * Renders a plain text node.
   * @param parent - Parent Virtual DOM node.
   * @param text - The text to render.
   */
  protected renderText(parent: Node<T>, text: string): Branch<T, U> {
    const node = new TextNode(parent);
    node.element = this.renderer.createText(text, node.parentElement);
    node.once('remove', () => this.renderer.removeChild(node.parentElement!, node.element!), true);

    return { node, children: null as never };
  }

  /**
   * Renders a component node.
   * @param node - Parent Virtual DOM node.
   * @param component - The component to render.
   * @param props - The component props.
   */
  protected renderComponent<P extends Record<string, unknown>>(
    node: Node<T>,
    component: ComponentType<U, P>,
    props: P,
  ): Branch<T, U> {
    if (!isClassComponent<U, P>(component)) {
      return { node, children: (component as Callable)(props) };
    }

    // eslint-disable-next-line new-cap
    return { node, children: new component(props).render() };
  }

  /**
   * Renders a DOM node.
   * @param parent - Parent Virtual DOM node.
   * @param type - The DOM node type or tag.
   * @param props - The DOM node properties/attributes.
   */
  protected renderNode<E extends ElementType<U>>(parent: Node<T>, type: E, props: PropsOf<E, U>): Branch<T, U> {
    const node = new ContainerNode(parent);
    node.element = this.renderer.createElement(type, node.parentElement);
    node.once('remove', () => this.renderer.removeChild(node.parentElement!, node.element!), true);
    this.setProperties(node, props);

    return { node, children: props.children as Children<U> };
  }

  private setProperties<E extends ElementType<U>>(node: ContainerNode<T>, props: PropsOf<E, U>): void {
    Object.keys(props).forEach((prop) => {
      if (prop === 'children') {
        return;
      }

      if (prop.startsWith('on')) {
        return void this.setListener(node, props, prop);
      }

      this.setProperty(node, props, prop);
    });
  }

  /**
   * Sets a DOM node property
   * @param node - Virtual DOM node corresponding to the DOM node.
   * @param props - Properties map.
   * @param prop - The property name to set.
   */
  protected setProperty<E extends ElementType<U>>(
    node: ContainerNode<T>,
    props: PropsOf<E, U>,
    prop: keyof PropsOf<E, U>,
  ): void {
    const observable = $observable($evaluable(props, prop));
    const update = (value?: Evaluated<typeof props[typeof prop]>): void =>
      value == null
        ? this.renderer.removeAttribute<E>(node.element!, prop)
        : this.renderer.setAttribute<E, typeof prop>(node.element!, prop, value as PropsOf<E, U>[typeof prop]);

    update(observable.call().get());

    const unobserve = observable.observe(update);
    node.once('remove', unobserve, true);
  }

  /**
   * Sets a DOM node event listener.
   * @param node - Virtual DOM node corresponding to the DOM node.
   * @param props - Properties map.
   * @param prop - Property name of the event listener.
   */
  protected setListener<E extends ElementType<U>>(
    node: ContainerNode<T>,
    props: PropsOf<E, U>,
    prop: keyof PropsOf<E, U> & string,
  ): void {
    let listener = props[prop];
    const event = prop.charAt(2).toLowerCase() + prop.slice(3);
    const subscribe = (): void =>
      void (isCallable(listener) && this.renderer.addEventListener(node.element!, event, listener));
    const unsubscribe = (): void =>
      void (isCallable(listener) && this.renderer.removeEventListener(node.element!, event, listener));
    const unobserve = $observable(props, prop).observe((value) => {
      unsubscribe();
      listener = value;
      subscribe();
    });

    subscribe();
    node.once(
      'remove',
      () => {
        unsubscribe();
        unobserve();
      },
      true,
    );
  }
}
