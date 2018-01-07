import { AbstractModel, Mutable } from '..';

class Model extends AbstractModel {
  @Mutable test1: string;
  @Mutable test2: string;
  @Mutable test3: Model;
}

let model: Model;

beforeEach(() => {
  model = new Model({
    test1: 'a',
    test2: 'b',
  });
});

it('should return default values', () => {
  expect(model.test1).toEqual('a');
  expect(model.test2).toEqual('b');
});

it('should observe changes', () => {
  const observer = jest.fn();
  model.addObserver(observer);
  model.test1 = 'c';
  model.test2 = 'b';
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer).toHaveBeenCalledWith('test1', 'c');
});

it('should observe nested', () => {
  const observer = jest.fn(),
    nested = new Model();
  model.test3 = nested;
  model.addObserver(observer);
  model.test3.test2 = 'd';
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer).toHaveBeenCalledWith('test3.test2', 'd');
});
