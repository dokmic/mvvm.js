/**
 * @jest-environment jsdom
 */

import { HtmlRenderer } from './html-renderer';

describe('HtmlRenderer', () => {
  let renderer: HtmlRenderer;

  beforeEach(() => {
    renderer = new HtmlRenderer();
  });

  describe('createElement', () => {
    beforeEach(() => {
      spyOn(document, 'createElement').and.callThrough();
    });

    it('should create an element', () => {
      const parent = document.createElement('div');
      const element = renderer.createElement('a', parent);

      expect(element.tagName).toBe('A');
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should accept the document node as a parent', () => {
      renderer.createElement('a', document);

      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('createText', () => {
    beforeEach(() => {
      spyOn(document, 'createTextNode').and.callThrough();
    });

    it('should create a text node', () => {
      const parent = document.createElement('div');
      const text = renderer.createText('something', parent);

      expect(text.data).toBe('something');
      expect(document.createTextNode).toHaveBeenCalledWith('something');
    });

    it('should accept the document node as a parent', () => {
      renderer.createText('something', document);

      expect(document.createTextNode).toHaveBeenCalledWith('something');
    });
  });

  describe('addEventListener', () => {
    let element: Element;
    const listener = jest.fn();

    beforeEach(() => {
      element = document.createElement('a');
      spyOn(element, 'addEventListener');
    });

    it('should add an event listener', () => {
      renderer.addEventListener(element, 'click', listener);

      expect(element.addEventListener).toHaveBeenCalledWith('click', listener, false);
    });

    it('should add a capturing event listener', () => {
      renderer.addEventListener(element, 'clickCapture', listener);

      expect(element.addEventListener).toHaveBeenCalledWith('click', listener, true);
    });
  });

  describe('removeEventListener', () => {
    let element: Element;
    const listener = jest.fn();

    beforeEach(() => {
      element = document.createElement('a');
      spyOn(element, 'removeEventListener');
    });

    it('should remove an event listener', () => {
      renderer.removeEventListener(element, 'click', listener);

      expect(element.removeEventListener).toHaveBeenCalledWith('click', listener, false);
    });

    it('should remove a capturing event listener', () => {
      renderer.removeEventListener(element, 'clickCapture', listener);

      expect(element.removeEventListener).toHaveBeenCalledWith('click', listener, true);
    });
  });

  describe('setAttribute', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('a');

      spyOn(element, 'setAttribute');
      spyOn(element.style, 'removeProperty');
      spyOn(element.style, 'setProperty');
    });

    it('should remove an attribute if an undefined value passed', () => {
      spyOn(renderer, 'removeAttribute');
      renderer.setAttribute(element, 'href', undefined);

      expect(renderer.removeAttribute).toHaveBeenCalledWith(element, 'href');
    });

    it('should remove an attribute if false passed', () => {
      spyOn(renderer, 'removeAttribute');
      renderer.setAttribute(element, 'href', false);

      expect(renderer.removeAttribute).toHaveBeenCalledWith(element, 'href');
    });

    it('should set a style property', () => {
      renderer.setAttribute(element, 'style', { textAlign: 'center', textDecoration: 'underline' });

      expect(element.style.setProperty).toHaveBeenCalledTimes(2);
      expect(element.style.setProperty).nthCalledWith(1, 'text-align', 'center');
      expect(element.style.setProperty).nthCalledWith(2, 'text-decoration', 'underline');
    });

    it('should remove a style property', () => {
      renderer.setAttribute(element, 'style', { textAlign: false, textDecoration: undefined });

      expect(element.style.removeProperty).toHaveBeenCalledTimes(2);
      expect(element.style.removeProperty).nthCalledWith(1, 'text-align');
      expect(element.style.removeProperty).nthCalledWith(2, 'text-decoration');
    });

    it('should set a CSS variable style property as-is', () => {
      renderer.setAttribute(element, 'style', { '--color': 'red' } as Record<string, unknown>);

      expect(element.style.setProperty).toHaveBeenCalledWith('--color', 'red');
    });

    it('should add dimensions for a numeric value', () => {
      renderer.setAttribute(element, 'style', { height: 0 });

      expect(element.style.setProperty).toHaveBeenCalledWith('height', '0px');
    });

    it('should not add dimensions for a non-dimensional property', () => {
      renderer.setAttribute(element, 'style', { zIndex: 10 });

      expect(element.style.setProperty).toHaveBeenCalledWith('z-index', '10');
    });

    it('should set an attribute', () => {
      renderer.setAttribute(element, 'data', 'value');

      expect(element.setAttribute).toHaveBeenCalledWith('data', 'value');
    });

    it('should set a class attribute via className property', () => {
      renderer.setAttribute(element, 'className', 'something');

      expect(element.setAttribute).toHaveBeenCalledWith('class', 'something');
    });
  });

  describe('removeAttribute', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('a');

      spyOn(element, 'removeAttribute');
    });

    it('should remove an attribute', () => {
      renderer.removeAttribute(element, 'data');

      expect(element.removeAttribute).toHaveBeenCalledWith('data');
    });

    it('should remove a class attribute via className property', () => {
      renderer.removeAttribute(element, 'className');

      expect(element.removeAttribute).toHaveBeenCalledWith('class');
    });
  });

  describe('insertChild', () => {
    let a: HTMLElement;
    let b: HTMLElement;
    let container: HTMLElement;
    let element: HTMLElement;

    beforeEach(() => {
      a = document.createElement('a');
      b = document.createElement('b');
      container = document.createElement('div');
      element = document.createElement('i');

      container.append(a, b);
    });

    it('should prepend a child if the previous element is not set', () => {
      renderer.insertChild(container, element);

      expect(element.nextSibling).toBe(a);
    });

    it('should append a child if there is no next node', () => {
      renderer.insertChild(container, element, b);

      expect(b.nextSibling).toBe(element);
    });

    it('should insert a child after the specified element', () => {
      renderer.insertChild(container, element, a);

      expect(a.nextSibling).toBe(element);
      expect(element.nextSibling).toBe(b);
    });
  });

  describe('removeChild', () => {
    let container: HTMLElement;
    let element: HTMLElement;

    beforeEach(() => {
      container = document.createElement('div');
      element = document.createElement('i');
      container.append(element);

      spyOn(container, 'removeChild');
    });

    it('should remove a child', () => {
      renderer.removeChild(container, element);

      expect(container.removeChild).toHaveBeenCalledWith(element);
    });
  });
});
