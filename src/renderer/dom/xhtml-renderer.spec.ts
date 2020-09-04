/**
 * @jest-environment jsdom
 */

import { XhtmlRenderer } from './xhtml-renderer';

describe('XhtmlRenderer', () => {
  let renderer: XhtmlRenderer;

  beforeEach(() => {
    renderer = new XhtmlRenderer();
  });

  describe('createElement', () => {
    beforeEach(() => {
      spyOn(document, 'createElement').and.callThrough();
      spyOn(document, 'createElementNS').and.callThrough();
    });

    it('should fall back to the HTML namespace when a namespace cannot be determined', () => {
      const parent = document.createElement('div');
      renderer.createElement('a', parent);

      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should create a regular element for the HTML namespace', () => {
      const parent = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      renderer.createElement('a', parent);

      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should use the HTML namespace for the SVG foreignObject', () => {
      const parent = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      renderer.createElement('foreignObject', parent);

      expect(document.createElement).toHaveBeenCalledWith('foreignObject');
    });

    it('should create a namespaced element', () => {
      const parent = document.createElement('div');
      renderer.createElement('svg', parent);

      expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'svg');
    });

    it('should accept the document node as a parent', () => {
      renderer.createElement('svg', document);

      expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'svg');
    });
  });

  describe('setAttribute', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('a');
    });

    it('should set a regular attribute', () => {
      spyOn(element, 'setAttribute');
      renderer.setAttribute(element, 'href', 'something');

      expect(element.setAttribute).toHaveBeenCalledWith('href', 'something');
    });

    it('should set a namespaced attribute', () => {
      spyOn(element, 'setAttributeNS');
      renderer.setAttribute(element, 'xlinkHref' as keyof unknown, 'something' as never);

      expect(element.setAttributeNS).toHaveBeenCalledWith('http://www.w3.org/1999/xlink', 'xlink:href', 'something');
    });

    it('should remove a namespaced attribute on empty value', () => {
      spyOn(renderer, 'removeAttribute');
      renderer.setAttribute(element, 'xlinkHref' as keyof unknown, false);

      expect(renderer.removeAttribute).toHaveBeenCalledWith(element, 'xlinkHref');
    });
  });

  describe('removeAttribute', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('a');
    });

    it('should remove a regular attribute', () => {
      spyOn(element, 'removeAttribute');
      renderer.removeAttribute(element, 'href');

      expect(element.removeAttribute).toHaveBeenCalledWith('href');
    });

    it('should remove a namespaced attribute', () => {
      spyOn(element, 'removeAttributeNS');
      renderer.removeAttribute(element, 'xlinkHref' as keyof unknown);

      expect(element.removeAttributeNS).toHaveBeenCalledWith('http://www.w3.org/1999/xlink', 'xlink:href');
    });

    it('should remove a namespaced attribute on empty value', () => {
      spyOn(renderer, 'removeAttribute');
      renderer.setAttribute(element, 'xlinkHref' as keyof unknown, false);

      expect(renderer.removeAttribute).toHaveBeenCalledWith(element, 'xlinkHref');
    });
  });
});
