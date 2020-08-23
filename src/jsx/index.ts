import { Children, Elements } from './element';
import { Tree } from './tree';
import { Renderer } from './renderer';
import { RootNode } from './node';

/**
 * Render a Virtual DOM element.
 * @param renderer - Platform-specific renderer.
 * @param children - The Virtual DOM elements to render.
 * @param container - Target DOM element.
 */
export function render<T, U extends Elements<U>>(renderer: Renderer<T, U>, children: Children<U>, container: T): void {
  const tree = new Tree(renderer);

  return tree.render(new RootNode(container), children);
}

export * from './element';
export * from './node';
export * from './tree';
export * from './renderer';
