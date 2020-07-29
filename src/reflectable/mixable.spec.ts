import { mix } from './mixable';

describe('mix', () => {
  it('should pipe values', () => {
    const A = class {};
    const b = jest.fn(() => 'b');
    const c = jest.fn(() => 'c');

    expect(mix(A, b, c)).toBe('c');
    expect(b).toHaveBeenCalledWith(A);
    expect(c).toHaveBeenCalledWith('b');
  });
});
