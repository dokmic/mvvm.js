import { Constructor } from '../reflectable';
import { Property } from '../property';

/**
 * Observables tracer.
 */
export interface Tracer<T = unknown> {
  /**
   * Starts tracing.
   */
  start(): this;

  /**
   * Trace a value.
   * @param value - The value to put into the memory.
   */
  trace(value: T): this;

  /**
   * Stops tracing.
   */
  end(): T[];
}

/**
 * Simple tracer implementation.
 */
export class TracerImpl<T = unknown> {
  private tracing: T[][] = [];

  start(): this {
    this.tracing.push([]);

    return this;
  }

  trace(value: T): this {
    if (this.tracing.length) {
      this.tracing[this.tracing.length - 1].push(value);
    }

    return this;
  }

  end(): T[] {
    return this.tracing.pop() ?? [];
  }
}

/**
 * Traceable property implementation mixin.
 * The implementation traces all the properties that have been accessed.
 * @param tracer - The properties tracer.
 */
export function TraceableMixin(tracer: Tracer) {
  return <T extends Constructor<Property>>(Super: T) =>
    class TraceableObject extends Super {
      get(): unknown {
        tracer.trace(this);

        return super.get();
      }
    };
}
