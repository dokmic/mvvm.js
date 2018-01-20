import {
  AbstractModel,
  AbstractViewModel,
  AbstractView,
  Mutable,
  Bindable,
  Binding,
} from '..';

const binding = jest.fn(),
  render = jest.fn();

class Model extends AbstractModel {
  @Mutable test1: string;
}

class ViewModel extends AbstractViewModel {
  @Bindable test1: string;
}

class View extends AbstractView {
  render() {}
  @Binding test1(value: string) {
    binding(value);
  }
}

let model: Model,
  vm: ViewModel,
  view: View;

beforeEach(() => {
  model = new Model({
    test1: 'a',
  });
  vm = new ViewModel(model);
  view = new View(vm);
  jest.restoreAllMocks();
});

it('should call binding', () => {
  model.test1 = 'b';

  expect(binding).toHaveBeenCalledTimes(2);
  expect(binding).toHaveBeenNthCalledWith(1, 'a');
  expect(binding).toHaveBeenNthCalledWith(2, 'b');
});
