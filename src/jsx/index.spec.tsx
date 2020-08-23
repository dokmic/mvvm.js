import { ElementType, createElement } from './element';
import { Renderer } from './renderer';
import { render } from './index';

type Elements = { [type: string]: any };
type Element = ElementType<Elements>;

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
declare namespace createElement {
  namespace JSX {
    interface IntrinsicElements extends Elements {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */

describe('render', () => {
  const renderer = ({
    createElement: jest.fn((type: string) => type),
    insertChild: jest.fn(),
  } as unknown) as jest.Mocked<Renderer<Element, Elements>>;

  beforeEach(() => {
    jest.clearAllMocks();
    render(
      renderer,
      <b>
        <c />
        <d />
      </b>,
      'a',
    );
  });

  it('should create elements', () => {
    expect(renderer.createElement).toHaveBeenCalledTimes(3);
    expect(renderer.createElement).nthCalledWith(1, 'b', 'a');
    expect(renderer.createElement).nthCalledWith(2, 'c', 'b');
    expect(renderer.createElement).nthCalledWith(3, 'd', 'b');
  });

  it('should insert elements', () => {
    expect(renderer.insertChild).toHaveBeenCalledTimes(3);
    expect(renderer.insertChild).nthCalledWith(1, 'a', 'b', undefined);
    expect(renderer.insertChild).nthCalledWith(2, 'b', 'c', undefined);
    expect(renderer.insertChild).nthCalledWith(3, 'b', 'd', 'c');
  });
});
