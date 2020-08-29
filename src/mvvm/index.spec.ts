import { createElement } from '../jsx';
import { Bind, Component, Default, Input } from './index';

interface Model {
  prop?: string;
}

class TestComponent extends Component<Model> {
  @Input @Default('default') prop!: string;

  @Bind style() {
    return { fontWeight: 'bold' };
  }

  render() {
    return createElement('a');
  }
}

describe('Input', () => {
  it('should bind a value', () => {
    const component = new TestComponent({ prop: 'value' });

    expect(component.prop).toBe('value');
  });
});

describe('Default', () => {
  it('should set a value', () => {
    const component = new TestComponent({});

    expect(component.prop).toBe('default');
  });
});

describe('Bind', () => {
  it('should bind a property', () => {
    const component = new TestComponent({});
    const element = component.render();

    expect(element.props.style).toBeFunction();
    expect((element.props.style as () => any)()).toEqual({ fontWeight: 'bold' });
  });
});
