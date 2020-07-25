import { PropertyImpl, Property } from '../property';
import { TraceableMixin, TracerImpl, Tracer } from './tracer';

describe('TracerImpl', () => {
  let tracer: TracerImpl;

  beforeEach(() => {
    tracer = new TracerImpl();
  });

  describe('start', () => {
    it('should implement a fluent interface', () => {
      expect(tracer.start()).toBe(tracer);
    });
  });

  describe('trace', () => {
    it('should implement a fluent interface', () => {
      expect(tracer.trace('something')).toBe(tracer);
    });

    it('should not fail if not started', () => {
      tracer.start();

      expect(() => tracer.trace('something')).not.toThrow();
    });
  });

  describe('end', () => {
    it('should return an empty array if not started', () => {
      expect(tracer.end()).toEqual([]);
    });

    it('should return traced values', () => {
      tracer.start();
      tracer.trace('value1');
      tracer.trace('value2');

      expect(tracer.end()).toEqual(['value1', 'value2']);
    });

    it('should stack traced values', () => {
      tracer.start();
      tracer.trace('value1');
      tracer.start();
      tracer.trace('value2');

      expect(tracer.end()).toEqual(['value2']);
      expect(tracer.end()).toEqual(['value1']);
    });
  });
});

describe('TraceableMixin', () => {
  let property: Property<string>;
  let tracer: jest.Mocked<Tracer>;

  beforeEach(() => {
    tracer = ({ trace: jest.fn() } as unknown) as jest.Mocked<Tracer>;
    property = new (TraceableMixin(tracer)(PropertyImpl))('value') as typeof property;
  });

  describe('get', () => {
    it('should return a property value', () => {
      expect(property.get()).toBe('value');
    });

    it('should trace a property', () => {
      property.get();

      expect(tracer.trace).toHaveBeenCalledWith(property);
    });
  });
});
