import { mix, Constructor } from '../reflectable';
import { ExpressionImpl, ProxyImpl } from '../property';
import { Observable } from './observable';
import { ObservableFactory } from './factory';
import { ObservableExpressionMixin } from './expression';
import { ObservablePropertyMixin } from './property';
import { TraceableMixin, TracerImpl } from './tracer';

const tracer = new TracerImpl<Observable>();
const factory = new ObservableFactory(
  mix(ProxyImpl, ObservablePropertyMixin(), TraceableMixin(tracer)) as typeof ProxyImpl & Constructor<Observable>,
  mix(ExpressionImpl, ObservableExpressionMixin(tracer), TraceableMixin(tracer)) as typeof ExpressionImpl &
    Constructor<Observable>,
);

export const $observable = factory.make.bind(factory);

export * from './expression';
export * from './factory';
export * from './observable';
export * from './property';
export * from './tracer';
