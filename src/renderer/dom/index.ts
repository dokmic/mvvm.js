import { Children, render as $render } from 'mvvm.js';
import { Elements } from './elements';
import { XhtmlRenderer } from './xhtml-renderer';

const renderer = new XhtmlRenderer();

/**
 * Render a Virtual DOM element.
 * @param children - The Virtual DOM elements to render.
 * @param container - Target DOM element.
 */
export function render(children: Children<Elements>, container: Document | Element): void {
  $render(renderer, children, container);
}

export * from './elements';
