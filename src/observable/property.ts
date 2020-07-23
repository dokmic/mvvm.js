import { Callable, Constructor } from '../reflectable';
import { Observable, ObservableMixin, isObservable } from './observable';
import { Property } from '../property';

const UNSUBSCRIBE = Symbol('unsubcribe');

/**
 * Base observable property implementation mixin.
 * The implementation calls the registered observers upon new value assignment.
 */
export function ObservablePropertyMixin<T>() {
  return <U extends Constructor<Property<T>>>(Super: U) =>
    (class ObservableProperty extends (ObservableMixin<T>()(Super) as Constructor<Property<T> & Observable<T>>) {
      /* private */ [UNSUBSCRIBE]: Callable<void, []>;

      set(value: T): void {
        const stored = super.get();

        if (this[UNSUBSCRIBE]) {
          this[UNSUBSCRIBE]();
        }

        super.set(value);

        if (isObservable(value)) {
          this[UNSUBSCRIBE] = value.observe(() => this.notify(value));
        }

        if (stored !== value) {
          this.notify(value);
        }
      }
    } as unknown) as U & Constructor<Observable<T>>;
}
