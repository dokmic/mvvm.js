import { ClassComponent, Element, createElement, isClassComponent } from './element';

describe('Component', () => {
  it('should store props', () => {
    const props = {};
    const component = new (class extends ClassComponent {
      render = jest.fn();
    })(props);

    expect(component.props).toBe(props);
  });
});

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

describe('isClassComponent', () => {
  it('should return true for a class component', () => {
    const Something = class extends ClassComponent {
      render = jest.fn();
    };

    expect(isClassComponent(Something)).toBeTrue();
  });

  it('should return true for an extended class component', () => {
    const Parent = class extends ClassComponent {
      render = jest.fn();
    };

    expect(isClassComponent(class extends Parent {})).toBeTrue();
  });

  it('should return false for an empty value', () => {
    expect(isClassComponent(undefined)).toBeFalse();
    expect(isClassComponent(null)).toBeFalse();
  });

  it('should return false for not a class component', () => {
    expect(isClassComponent(class {})).toBeFalse();
  });

  it('should return false for a function component', () => {
    expect(isClassComponent(jest.fn())).toBeFalse();
  });
});
