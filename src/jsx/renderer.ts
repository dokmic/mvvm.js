import { ElementType, Elements, PropsOf } from './element';

/**
 * JSX static element renderer.
 */
export interface Renderer<T = unknown, U extends Elements<U> = Elements> {
  /**
   * Creates an element based on it's type.
   * @param type - The element type.
   * @param parent - Parent element.
   * @returns The element.
   */
  createElement(type: ElementType<U>, parent?: T): T;

  /**
   * Creates a text element.
   * @param text - The element contents.
   * @param parent - Parent element.
   * @returns The text element.
   */
  createText(text: string, parent?: T): T;

  /**
   * Adds an event listener to an element.
   * @param element - The element listening on.
   * @param event - The event name.
   * @param listener - The listener function.
   */
  addEventListener(element: T, event: string, listener: CallableFunction): void;

  /**
   * Removes a previously added event listener.
   * @param element - The element listening on.
   * @param event - The event name.
   * @param listener - The listener function.
   */
  removeEventListener(element: T, event: string, listener: CallableFunction): void;

  /**
   * Sets an attribute on an element.
   * @param element - The target element.
   * @param attribute - The attribute name.
   * @param value - The attribute value.
   */
  setAttribute<E extends ElementType<U>, A extends keyof PropsOf<E, U>>(
    element: T,
    attribute: A,
    value: PropsOf<E, U>[A],
  ): void;

  /**
   * Removes an attribute from an element.
   * @param element - The target element.
   * @param attribute - The attribute name.
   */
  removeAttribute<E extends ElementType<U>>(element: T, attribute: keyof PropsOf<E, U>): void;

  /**
   * Attaches a child to an element.
   * @param element - The parent element.
   * @param child - The child element.
   * @param previous - The previous element.
   */
  insertChild(element: T, child: T, previous?: T): void;

  /**
   * Detaches a child from an element.
   * @param element - The parent element.
   * @param child - The child element.
   */
  removeChild(element: T, child: T): void;
}
