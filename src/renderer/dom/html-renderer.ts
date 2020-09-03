// eslint-disable-next-line import/no-extraneous-dependencies
import { Properties } from 'csstype';
import { Renderer, PropsOf } from 'mvvm.js';
import { Elements } from './elements';

const CAMEL_CASE = /[A-Z]/g;
/** @see https://github.com/preactjs/preact/blob/master/src/constants.js */
const IS_NOT_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function normalize(event: string) {
  const capture = event.endsWith('Capture');
  const name = capture ? event.substr(0, event.length - 7) : event;

  return { capture, name };
}

/**
 * HTML elements renderer.
 */
export class HtmlRenderer implements Renderer<Node, Elements> {
  createElement(type: keyof Elements, parent: Node): Element {
    return (parent.ownerDocument ?? (parent as Document)).createElement(type);
  }

  createText(text: string, parent: Node): Text {
    return (parent.ownerDocument ?? (parent as Document)).createTextNode(text);
  }

  addEventListener(element: Element, event: string, listener: EventListener): void {
    const { capture, name } = normalize(event);

    element.addEventListener(name, listener, capture);
  }

  removeEventListener(element: Element, event: string, listener: EventListener): void {
    const { capture, name } = normalize(event);

    element.removeEventListener(name, listener, capture);
  }

  setAttribute<E extends keyof Elements, A extends keyof PropsOf<E, Elements>>(
    element: Element,
    attribute: A,
    value: PropsOf<E, Elements>[A] | false,
  ): void {
    if (value == null || value === false) {
      return void this.removeAttribute<E>(element, attribute);
    }

    if (attribute === 'style' && typeof value !== 'string') {
      return void this.setStyle(element as HTMLElement, value as Properties);
    }

    element.setAttribute(attribute === 'className' ? 'class' : (attribute as string), (value as unknown) as string);
  }

  removeAttribute<E extends keyof Elements>(element: Element, attribute: keyof PropsOf<E, Elements>): void {
    element.removeAttribute(attribute === 'className' ? 'class' : (attribute as string));
  }

  protected setStyle(element: HTMLElement, properties: Properties): void {
    Object.entries(properties as Record<string, string | number | false | undefined>).forEach(([key, data]) => {
      const property = key.startsWith('--') ? key : key.replace(CAMEL_CASE, '-$&').toLowerCase();

      if (data == null || data === false) {
        return void element.style.removeProperty(property);
      }

      const value = typeof data !== 'number' || IS_NOT_DIMENSIONAL.test(key) ? `${data}` : `${data}px`;
      element.style.setProperty(property, value);
    });
  }

  insertChild(container: Element, child: Element | Text, previous?: Element | Text): void {
    if (!previous) {
      return void container.prepend(child);
    }

    if (!previous.nextSibling) {
      return void container.appendChild(child);
    }

    container.insertBefore(child, previous.nextSibling);
  }

  removeChild(container: Element, child: Element | Text): void {
    container.removeChild(child);
  }
}
