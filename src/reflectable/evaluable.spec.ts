import { $evaluable } from './evaluable';

describe('$evaluable', () => {
  it('should wrap a value inside a function', () => {
    const object = { a: 1 };
    const evaluable = $evaluable(object, 'a');

    expect(evaluable).toBeInstanceOf(Function);
    expect(evaluable()).toBe(1);
  });

  it('should evaluate a value if it is a function', () => {
    const object = { a: () => 1 };
    const evaluable = $evaluable(object, 'a');

    expect(evaluable()).toBe(1);
  });

  it('should evaluate a nested object', () => {
    const object = { a: { b: () => 1, c: 2 } };
    const evaluable = $evaluable(object, 'a');

    expect(evaluable()).toMatchObject({ b: 1, c: 2 });
  });
});
