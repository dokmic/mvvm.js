import { PropsOf } from 'mvvm.js';
import { HtmlRenderer } from './html-renderer';
import { Elements } from './elements';

function capitalize(token: string): string {
  return token[1].toUpperCase();
}

const CAMELIZE = /[-:]([a-z])/g;

enum Namespace {
  HTML = 'http://www.w3.org/1999/xhtml',
  Math = 'http://www.w3.org/1998/Math/MathML',
  SVG = 'http://www.w3.org/2000/svg',
  XLink = 'http://www.w3.org/1999/xlink',
  XML = 'http://www.w3.org/XML/1998/namespace',
}

const NAMESPACE_ATTRIBUTES = {
  'xlink:actuate': Namespace.XLink,
  'xlink:arcrole': Namespace.XLink,
  'xlink:role': Namespace.XLink,
  'xlink:show': Namespace.XLink,
  'xlink:title': Namespace.XLink,
  'xlink:type': Namespace.XLink,
  'xlink:href': Namespace.XLink,

  'xml:base': Namespace.XML,
  'xml:lang': Namespace.XML,
  'xml:space': Namespace.XML,
};

const NAMESPACE_ELEMENTS = {
  html: Namespace.HTML,
  mathml: Namespace.Math,
  svg: Namespace.SVG,
} as Record<string, string>;

const NAMESPACE_PROPS = Object.entries(NAMESPACE_ATTRIBUTES).reduce(
  (nsAttributes, [attribute, namespace]) =>
    Object.assign(nsAttributes, {
      [attribute.replace(CAMELIZE, capitalize)]: { attribute, namespace },
    }),
  {} as Record<string, { attribute: string; namespace: string }>,
);

/**
 * XHTML elements renderer.
 */
export class XhtmlRenderer extends HtmlRenderer {
  createElement(type: keyof Elements, parent: Node): Element {
    let namespace = parent.namespaceURI;
    if (namespace == null || namespace === Namespace.HTML) {
      namespace = NAMESPACE_ELEMENTS[type] ?? Namespace.HTML;
    }

    if (namespace === Namespace.SVG && type === 'foreignObject') {
      namespace = Namespace.HTML;
    }

    if (namespace === Namespace.HTML) {
      return super.createElement(type, parent);
    }

    return (parent.ownerDocument ?? (parent as Document)).createElementNS(namespace, type);
  }

  setAttribute<E extends keyof Elements, A extends keyof PropsOf<E, Elements>>(
    element: Element,
    attribute: A,
    value: PropsOf<E, Elements>[A] | false,
  ): void {
    if (!(attribute in NAMESPACE_PROPS)) {
      return void super.setAttribute(element, attribute, value);
    }

    if (value == null || value === false) {
      return void this.removeAttribute<E>(element, attribute);
    }

    element.setAttributeNS(
      NAMESPACE_PROPS[attribute as string].namespace,
      NAMESPACE_PROPS[attribute as string].attribute,
      (value as unknown) as string,
    );
  }

  removeAttribute<E extends keyof Elements>(element: Element, attribute: keyof PropsOf<E, Elements>): void {
    if (!(attribute in NAMESPACE_PROPS)) {
      return void super.removeAttribute(element, attribute);
    }

    element.removeAttributeNS(
      NAMESPACE_PROPS[attribute as string].namespace,
      NAMESPACE_PROPS[attribute as string].attribute,
    );
  }
}
