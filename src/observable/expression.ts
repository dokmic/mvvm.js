import { Callable, Constructor } from '../reflectable';
import { Expression } from '../property';
import { Observable, ObservableMixin } from './observable';
import { Tracer } from './tracer';

const SUBSCRIPTIONS = Symbol('subscriptions');

/**
 * Base observable expression implementation mixin.
 * The implementation traces all the dependencies and calls the expression upon change.
 * @param tracer - Observables tracer.
 */
export function ObservableExpressionMixin<T>(tracer: Tracer<Observable<T>>) {
  return <U extends Constructor<Expression<T>>>(Super: U): U & Constructor<Observable<T>> =>
    class ObservableExpression extends (ObservableMixin<T>()(Super) as Constructor<Expression<T> & Observable<T>>) {
      private [SUBSCRIPTIONS]: Callable<void, []>[];

      call(): this {
        const previous = super.get();

        if (this[SUBSCRIPTIONS]) {
          this[SUBSCRIPTIONS].splice(0).forEach((unsubscribe) => unsubscribe());
        }

        tracer.start();
        try {
          super.call();
        } finally {
          const observer = this.call.bind(this);

          this[SUBSCRIPTIONS] = tracer
            .end()
            .filter((observable) => observable !== this)
            .map((observable) => observable.observe(observer));
        }

        const current = super.get();
        if (current !== previous) {
          this.notify(current);
        }

        return this;
      }
    } as any;
}
