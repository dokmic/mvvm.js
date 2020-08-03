import { CommandableMixin } from './commandable';
import { RuntimeDecorator } from './decoratable';

describe('CommandableMixin', () => {
  const decorator = new RuntimeDecorator('commands');
  const method = jest.fn((value) => value);
  let getDecorated: jest.SpyInstance;

  class Commandable extends CommandableMixin(decorator)(class {}) {
    method(value: unknown): unknown {
      return method(value);
    }
  }

  beforeEach(() => {
    getDecorated = jest.spyOn(decorator, 'getDecorated');

    jest.clearAllMocks();
    getDecorated.mockReturnValue({ method: [] });
  });

  describe('on', () => {
    it('should call a command listener with parameters', () => {
      const commandable = new Commandable();
      const listener = jest.fn();

      commandable.on('method', listener);

      expect(commandable.method('something')).toBe('something');
      expect(listener).toHaveBeenCalledWith(commandable, 'something');
    });

    it('should call a listener on command with a different name', () => {
      getDecorated.mockReturnValueOnce({ method: ['on'] });

      const commandable = new Commandable();
      const listener = jest.fn();

      commandable.on('on', listener);
      commandable.method('something');

      expect(listener).toHaveBeenCalledWith(commandable, 'something');
    });

    it('should call multiple listeners', () => {
      const commandable = new Commandable();
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      commandable.on('method', listener1);
      commandable.on('method', listener2);
      commandable.method('something');

      expect(listener1).toHaveBeenCalledWith(commandable, 'something');
      expect(listener2).toHaveBeenCalledWith(commandable, 'something');
    });

    it('should call a listener before a method call', () => {
      const commandable = new Commandable();
      const listener = jest.fn();

      commandable.on('method', listener, true);
      commandable.method('something');

      expect(listener).toHaveBeenCalledBefore(method);
    });

    it('should call a listener after a method call', () => {
      const commandable = new Commandable();
      const listener = jest.fn();

      commandable.on('method', listener);
      commandable.method('something');

      expect(listener).toHaveBeenCalledAfter(method);
    });
  });

  describe('once', () => {
    it('should call a listener only once', () => {
      const commandable = new Commandable();
      const listener = jest.fn();

      commandable.once('method', listener);
      commandable.method('something');
      commandable.method('something');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('should not call a listener before a method call', () => {
      const commandable = new Commandable();
      const listener = jest.fn();

      commandable.on('method', listener, true);
      commandable.off('method', listener, true);
      commandable.method('something');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should not call a listener after a method call', () => {
      const commandable = new Commandable();
      const listener = jest.fn();

      commandable.on('method', listener);
      commandable.off('method', listener);
      commandable.method('something');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should not fail if there is no listener', () => {
      const commandable = new Commandable();
      const listener = jest.fn();

      expect(() => commandable.off('method', listener)).not.toThrow();
    });
  });
});
