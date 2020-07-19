import { ProxyImpl } from './proxy';

describe('ProxyImpl', () => {
  describe('constructor', () => {
    it('should use object value when there is no descriptor', () => {
      const object = { something: 'value' };
      const proxy = new ProxyImpl(object, 'something');

      expect(proxy.get()).toBe('value');
    });

    it('should inherit descriptor options', () => {
      const object: { something?: number } = {};
      Object.defineProperty(object, 'something', {
        configurable: false,
        enumerable: false,
        get() {
          return 1;
        },
      });
      const proxy = new ProxyImpl(object, 'something');

      expect(proxy.configurable).toBe(false);
      expect(proxy.enumerable).toBe(false);
    });
  });

  describe('get', () => {
    it('should call source getter', () => {
      const object: { something?: string } = {};
      const get = jest.fn(() => 'value');
      Object.defineProperty(object, 'something', { get });
      const proxy = new ProxyImpl(object, 'something');

      expect(proxy.get()).toBe('value');
      expect(get).toHaveBeenCalled();
    });

    it('should return undefined when the property is not readable', () => {
      const object: { something?: string } = {};
      Object.defineProperty(object, 'something', { set: jest.fn() });
      const proxy = new ProxyImpl(object, 'something');

      expect(proxy.get()).toBeUndefined();
    });

    it('should return stored value when there is no descriptor', () => {
      const object = { something: 'value' };
      const proxy = new ProxyImpl(object, 'something');

      expect(proxy.get()).toBe('value');
    });
  });

  describe('set', () => {
    it('should call source setter', () => {
      const object: { something?: string } = {};
      const set = jest.fn();
      Object.defineProperty(object, 'something', { set });
      const proxy = new ProxyImpl(object, 'something');
      proxy.set('value');

      expect(set).toHaveBeenCalledWith('value');
    });

    it('should not fail when the property is not writable', () => {
      const object: { something?: string } = {};
      Object.defineProperty(object, 'something', { get: jest.fn() });
      const proxy = new ProxyImpl(object, 'something');

      expect(() => proxy.set('value')).not.toThrowError();
    });

    it('should update the stored value when there is no descriptor', () => {
      const object: { something?: string } = {};
      const proxy = new ProxyImpl(object, 'something');
      proxy.set('value');

      expect(proxy.get()).toBe('value');
    });
  });
});
