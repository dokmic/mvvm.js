import { ArgumentsOf, Callable, Constructor, MethodOf } from './types';
import { RuntimeDecorator } from './decoratable';

/**
 * Command method decorator handle.
 */
export type Commands<T extends Commandable = Commandable> = RuntimeDecorator<T, [keyof T]>;

/**
 * Command method decorator.
 */
export type CommandDecorator = {
  /**
   * Marks the decorated method as a command.
   * @param command - The command name.
   * @example
   * class SomeComponent extends Component {
   *   Command('change') onClick(): void {
   *     // ...
   *   }
   * }
   */
  <T>(command: MethodOf<T>): <U extends T & Commandable>(type: U, property: MethodOf<U>) => void;

  /**
   * Marks the decorated method as a command with the same name.
   * @example
   * class SomeComponent extends Component {
   *   Command change(): void {
   *     // ...
   *   }
   * }
   */
  <T extends Commandable>(type: T, property: MethodOf<T>): void;
};

type Listener<T extends Commandable, M extends MethodOf<T>> = <U extends T>(
  object: U,
  ...args: ArgumentsOf<T[M]>
) => unknown;
type Listeners = Set<Listener<Commandable, any>>;
type Mapping = { [command: string]: Listeners };

/**
 * The Commandable object.
 */
export interface Commandable {
  /**
   * Adds a command listener.
   * @param command - The command name
   * @param listener - The command listener.
   */
  on<M extends MethodOf<this>>(command: M, listener: Listener<this, M>, capture?: boolean): this;

  /**
   * Adds a command listener, which will be removed after the first call.
   * @param command - The command name
   * @param listener - The command listener.
   */
  once<M extends MethodOf<this>>(command: M, listener: Listener<this, M>, capture?: boolean): this;

  /**
   * Removes a command listener.
   * @param command - The command name
   * @param listener - The command listener.
   */
  off<M extends MethodOf<this>>(command: M, listener: Listener<this, M>, capture?: boolean): this;
}

class Mappings {
  after: Mapping = {};

  before: Mapping = {};
}

const listeners = new WeakMap<Commandable, Mappings>();

function dispatch(instance: Commandable, mapping: keyof Mappings, command: string, params: unknown[]): void {
  const mappings = listeners.get(instance);

  if (mappings?.[mapping]?.[command]) {
    mappings[mapping][command].forEach((listener) => listener(instance, ...params));
  }
}

function invoke<T extends Commandable, M extends Callable>(
  this: T,
  method: M,
  command: string,
  ...params: ArgumentsOf<M>
): ReturnType<M> {
  dispatch(this, 'before', command, params);

  try {
    return method.apply(this, params);
  } finally {
    dispatch(this, 'after', command, params);
  }
}

/**
 * Base Commandable implementation mixin.
 * The implementation wraps decorated command methods so they can be listened.
 * @param commands - Command method decorator handle.
 */
export function CommandableMixin(commands: Commands) {
  return <Class extends Constructor>(Super: Class) =>
    class extends Super implements Commandable {
      constructor(...args: any[]) {
        super(...args);

        Object.entries(commands.getDecorated(this)).forEach(([property, [command = property]]) => {
          this[property] = invoke.bind(this, this[property], command);
        });
      }

      on<T extends Commandable, M extends MethodOf<T>>(
        this: T,
        command: M,
        listener: Listener<T, M>,
        capture = false,
      ): T {
        const mapping = capture ? 'before' : 'after';
        let mappings = listeners.get(this);
        if (!mappings) {
          listeners.set(this, (mappings = new Mappings()));
        }
        if (!mappings[mapping][command as string]) {
          mappings[mapping][command as string] = new Set();
        }

        mappings[mapping][command as string].add(listener);

        return this;
      }

      once<T extends Commandable, M extends MethodOf<T>>(
        this: T,
        command: M,
        listener: Listener<T, M>,
        capture = false,
      ): T {
        const wrapper = (object: T, ...params: ArgumentsOf<T[M]>): void => {
          try {
            listener(object, ...params);
          } finally {
            this.off(command, wrapper, capture);
          }
        };

        return this.on(command, wrapper, capture);
      }

      off<T extends Commandable, M extends MethodOf<T>>(
        this: T,
        command: M,
        listener: Listener<T, M>,
        capture = false,
      ): T {
        const mapping = capture ? 'before' : 'after';
        const mappings = listeners.get(this);

        // eslint-disable-next-line no-unused-expressions
        mappings?.[mapping]?.[command as string]?.delete(listener);

        return this;
      }
    };
}
