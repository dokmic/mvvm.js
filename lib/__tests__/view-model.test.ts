import {
  AbstractModel,
  AbstractCommandableViewModel,
  Mutable,
  Bindable,
  Command
} from '..';

class Model extends AbstractModel {
  @Mutable test1: string;
  @Mutable test2: string;
}

class ViewModel1 extends AbstractCommandableViewModel {
  @Bindable test1: string;
}

class ViewModel2 extends ViewModel1 {
  @Bindable test2: string;
  @Command click(event: any) {}
}

let model: Model,
  vm: ViewModel2;

beforeEach(() => {
  model = new Model({
    test1: 'a',
    test2: 'b',
  });
  vm = new ViewModel2(model);
});

it('should be linked to model', () => {
  expect(vm.test1).toEqual('a');
  expect(vm.test2).toEqual('b');

  model.test1 = 'c';
  model.test2 = 'd';

  expect(vm.test1).toEqual('c');
  expect(vm.test2).toEqual('d');
});

it('should be linked to view model', () => {
  vm.test1 = 'f';
  vm.test2 = 'g';

  expect(model.test1).toEqual('f');
  expect(model.test2).toEqual('g');
});

it('should be bounded directly', () => {
  const binding = jest.fn();
  vm.bind('test2', binding);

  model.test2 = 'h';

  expect(binding).toHaveBeenCalledTimes(2);
  expect(binding).toHaveBeenNthCalledWith(1, 'b');
  expect(binding).toHaveBeenNthCalledWith(2, 'h');
});

it('should be bounded through parent', () => {
  const binding = jest.fn();
  vm.bind('test1', binding);

  model.test1 = 'i';

  expect(binding).toHaveBeenCalledTimes(2);
  expect(binding).toHaveBeenNthCalledWith(1, 'a');
  expect(binding).toHaveBeenNthCalledWith(2, 'i');
});

it('should be definitve binding', () => {
  const binding = jest.fn();
  vm.bind('test3', binding);
  vm['test3'] = 'j';

  expect(binding).toHaveBeenCalledTimes(2);
  expect(binding).toHaveBeenNthCalledWith(1, undefined);
  expect(binding).toHaveBeenNthCalledWith(2, 'j');
});

it('should not be possible to bind', () => {
  const binding = jest.fn();
  Object.defineProperty(vm, 'test4', {
    get: () => 'k',
    set: () => {},
    configurable: false,
  });
  vm.bind('test4', binding);
  vm['test4'] = 'l';

  expect(binding).toHaveBeenCalledTimes(1);
  expect(binding).toHaveBeenCalledWith('k');
});

it('should listen command', () => {
  const listener = jest.fn();
  vm.on('click', listener);
  vm.click('m');

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(vm, 'm');
});
