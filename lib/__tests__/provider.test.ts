import {
  SimpleProvider,
  CachingProvider,
  ProvideDecorator
} from '..';

class Source {}

it('should resolve', () => {
  const provider = new SimpleProvider(),
    resolver = jest.fn(() => 'something'),
    instance = new Source();
  provider.register({
    source: Source,
    resolver,
  });

  expect(provider.resolve(instance)).toEqual('something');
  expect(resolver).toHaveBeenCalledTimes(1);
  expect(resolver).toHaveBeenLastCalledWith(instance);
});

it('should not resolve', () => {
  const provider = new SimpleProvider(),
    resolver = jest.fn(() => 'something'),
    instance = new Source();
  provider.register({
    source: Source,
    resolver,
  });

  expect(provider.resolve({})).toBeNull();
  expect(resolver).toHaveBeenCalledTimes(0);
});

it('should cache the resolution', () => {
  const provider = new CachingProvider(),
    resolution = {},
    resolver = jest.fn(() => resolution),
    instance = new Source();
  provider.register({
    source: Source,
    resolver,
  });

  expect(provider.resolve(instance)).toBe(resolution);
  expect(provider.resolve(instance)).toBe(resolution);
  expect(resolver).toHaveBeenCalledTimes(1);
  expect(resolver).toHaveBeenLastCalledWith(instance);
});

it('should wrap provider', () => {
  const provider = new SimpleProvider(),
    destination = jest.fn(() => 'something'),
    instance = new Source();

  expect(ProvideDecorator(provider, Source)(destination)).toBe(destination);

  provider.resolve(instance);
  expect(destination).toHaveBeenCalledTimes(1);
  expect(destination).toHaveBeenLastCalledWith(instance);
});
