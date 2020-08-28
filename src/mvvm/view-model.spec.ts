import { $reference } from '../property';
import { Commands } from '../reflectable';
import { Defaults, Inputs, ViewModelMixin } from './view-model';

type Model = Record<string, unknown>;

describe('ViewModelMixin', () => {
  const commands = ({ getDecorated: jest.fn(() => ({})) } as unknown) as jest.Mocked<Commands>;
  const defaults = ({ getDecorated: jest.fn(() => ({})) } as unknown) as jest.Mocked<Defaults>;
  const inputs = ({ getDecorated: jest.fn(() => ({})) } as unknown) as jest.Mocked<Inputs>;

  class ViewModel extends ViewModelMixin(
    commands,
    defaults,
    inputs,
  )(
    class BaseViewModel {
      prop?: string;

      constructor(readonly props: Model) {}

      on = jest.fn();

      once = jest.fn();

      off = jest.fn();
    },
  ) {}

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should resolve a reference', () => {
      const source = { something: {} };
      const model = { prop: $reference(source, 'something') };
      inputs.getDecorated.mockReturnValueOnce(({ prop: [] } as unknown) as ReturnType<typeof inputs.getDecorated>);
      const vm = new ViewModel(model);

      expect(vm.prop).toBe(source.something);
    });

    it('should evaluate an expression', () => {
      inputs.getDecorated.mockReturnValueOnce(({ prop: [] } as unknown) as ReturnType<typeof inputs.getDecorated>);
      const vm = new ViewModel({ prop: () => 'something' });

      expect(vm.prop).toBe('something');
    });

    it('should use a custom model property', () => {
      inputs.getDecorated.mockReturnValueOnce(({ prop: ['some'] } as unknown) as ReturnType<
        typeof inputs.getDecorated
      >);
      const vm = new ViewModel({ some: 'value' });

      expect(vm.prop).toBe('value');
    });

    it('should not override already defined accessor', () => {
      inputs.getDecorated.mockReturnValueOnce(({ prop: [] } as unknown) as ReturnType<typeof inputs.getDecorated>);
      const vm = new (class extends ViewModel {
        get some(): string {
          return 'value';
        }
      })({ some: 'something' });

      expect(vm.some).toBe('value');
    });

    it('should assign a default value', () => {
      inputs.getDecorated.mockReturnValueOnce(({ prop: [] } as unknown) as ReturnType<typeof inputs.getDecorated>);
      defaults.getDecorated.mockReturnValueOnce(({ prop: ['default'] } as unknown) as ReturnType<
        typeof defaults.getDecorated
      >);
      const vm = new ViewModel({});

      expect(vm.prop).toBe('default');
    });

    it('should not assign a default value', () => {
      inputs.getDecorated.mockReturnValueOnce({ prop: [] } as any);
      defaults.getDecorated.mockReturnValueOnce(({ prop: ['default'] } as unknown) as ReturnType<
        typeof defaults.getDecorated
      >);
      const vm = new ViewModel({ prop: 'value' });

      expect(vm.prop).toBe('value');
    });

    it('should subscribe for a command', () => {
      commands.getDecorated.mockReturnValueOnce(({ prop: [] } as unknown) as ReturnType<typeof commands.getDecorated>);
      const prop = jest.fn();
      const vm = new ViewModel({ prop });

      expect(vm.on).toHaveBeenCalledWith('prop', prop);
    });

    it('should not subscribe if there is no listener defined', () => {
      commands.getDecorated.mockReturnValueOnce(({ prop: [] } as unknown) as ReturnType<typeof commands.getDecorated>);
      const vm = new ViewModel({});

      expect(vm.on).not.toHaveBeenCalled();
    });

    it('should subscribe for a custom command', () => {
      commands.getDecorated.mockReturnValueOnce(({ prop: ['something'] } as unknown) as ReturnType<
        typeof commands.getDecorated
      >);
      const prop = jest.fn();
      const vm = new ViewModel({ prop });

      expect(vm.on).toHaveBeenCalledWith('something', prop);
    });
  });
});
