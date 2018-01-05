import { AbstractObservable } from '..';

class Observable extends AbstractObservable {
  test(...params: any[]) {
    this.notify(...params);
  }
}

let observable: Observable;

beforeEach(() => {
  observable = new Observable();
});

it('should add observer', () => {
  const observer = jest.fn();
  observable.addObserver(observer);
  observable.test('a', 'b');
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer).toHaveBeenCalledWith('a', 'b');
});

it('should remove observer', () => {
  const observer = jest.fn();
  observable.addObserver(observer);
  observable.test('a', 'b');
  observable.removeObserver(observer);
  observable.test('a', 'b');
  expect(observer).toHaveBeenCalledTimes(1);
});

it('should check observable', () => {
  expect(AbstractObservable.isObservable(observable)).toBe(true);
  expect(AbstractObservable.isObservable({})).toBe(false);
});
