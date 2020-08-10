import { Element, createElement } from './element';

describe('createElement', () => {
  it('should return element instance', () => {
    const element = createElement('div', { prop: 'value' });

    expect(element).toBeInstanceOf(Element);
    expect(element.type).toBe('div');
    expect(element.props).toMatchObject({
      prop: 'value',
      children: [],
    });
  });

  it('should pick children from props', () => {
    const element = createElement('div', { children: ['a', 'b'] });

    expect(element.props).toMatchObject({ children: ['a', 'b'] });
  });

  it('should pick children from arguments', () => {
    const element = createElement('div', { children: ['a', 'b'] }, 'c', 'd');

    expect(element.props).toMatchObject({ children: ['c', 'd'] });
  });
});
