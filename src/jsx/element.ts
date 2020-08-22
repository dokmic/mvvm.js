import { Callable, EvaluableObject } from '../reflectable';

type Many<T> = T[] | T[][];
type OneOrMany<T> = T | Many<T>;

/**
 * JSX dynamic element.
 */
export type Expression<T extends Elements<T>> = () => Children<T>;

/**
 * JSX empty element.
 */
export type Void = null | void | undefined;

/**
 * JSX child element.
 */
export type Child<T extends Elements<T>> = string | Void | Element<T, Type<T>> | Expression<T>;

/**
 * JSX children elements.
 */
export type Children<T extends Elements<T> = Elements> = OneOrMany<Child<T>>;

/**
 * JSX static element types and properties mapping.
 */
export interface Elements<T extends Elements<T> = Elements<any>> {
  [element: string]: WithChildren<Elements<T>, any>;
}

type PropsObject = Record<string, unknown>;
type WithChildren<T extends Elements<T>, P extends PropsObject> = P & { children?: Children<T> };

/**
 * JSX element properties.
 */
export type Props<T extends PropsObject = PropsObject> = EvaluableObject<T>;

/**
 * JSX element properties with children.
 */
export type PropsWithChildren<T extends PropsObject = PropsObject> = WithChildren<Elements, Props<T>>;

/**
 * Macro to generate typings compatible with TypeScript JSX.IntrinsicElements.
 */
export type IntrinsicElements<T extends Elements<T>> = {
  [K in keyof T]: T[K] extends { children: unknown } ? Props<T[K]> : WithChildren<T, Props<T[K]>>;
};

/**
 * JSX static element type.
 */
export type ElementType<T extends Elements<T>> = keyof T;

/**
 * JSX component base class.
 */
export abstract class ClassComponent<T extends Elements<T> = Elements, P extends PropsObject = PropsObject> {
  /**
   * @param props - Component properties.
   */
  constructor(readonly props: P) {}

  /**
   * Renders the component node.
   * @returns Rendered elements.
   */
  abstract render(): Children<T>;
}

interface ClassComponentType<T extends Elements<T>, P extends PropsObject> {
  new (props: P): ClassComponent<T, P>;
}

type FunctionComponentType<T extends Elements<T>, P extends PropsObject> = Callable<Children<T>, [P]>;

/**
 * JSX component element type.
 */
export type ComponentType<T extends Elements<T>, P extends PropsObject> =
  | ClassComponentType<T, P>
  | FunctionComponentType<T, P>;

/**
 * JSX element type.
 */
export type Type<T extends Elements<T>> = ElementType<T> | ComponentType<T, any>;

/**
 * Macro to get properties type.
 */
export type PropsOf<T extends Type<U>, U extends Elements<U> = Elements<any>> = T extends ElementType<U>
  ? U[T]
  : T extends ComponentType<U, infer P>
  ? P
  : never;

/**
 * Virtual DOM element.
 */
export class Element<T extends Elements<T>, U extends Type<T> = Type<T>> {
  /**
   * @param type - Element type.
   * @param props - Element properties.
   */
  constructor(readonly type: U, readonly props: PropsOf<U, T>) {}
}

/**
 * Virtual DOM fragment.
 */
export function Fragment<T extends Elements<T>>(props: WithChildren<T, PropsObject>): Children<T> {
  return props.children;
}

/**
 * Creates Virtual DOM element from JSX/HyperScript expression.
 * @param type - Virtual DOM element type.
 * @param props - Virtual DOM element properties.
 * @param children - Child elements.
 * @returns Virtual DOM element.
 */
export function createElement<T extends Elements<T>, U extends Type<T> = Type<T>>(
  type: U,
  props?: PropsOf<U, T>,
  ...children: Many<Children<T>>
): Element<T, U> {
  return new Element<T, typeof type>(
    type,
    Object.assign(props || ({} as PropsOf<U, T>), {
      children: children.length || !props?.children ? children : props.children,
    }),
  );
}

/**
 * Checks whether the value is a class component.
 * @returns `true` when the value is a class component type.
 */
export function isClassComponent<T extends Elements<T>, P extends PropsObject>(
  value: any,
): value is ClassComponentType<T, P> {
  return value?.prototype instanceof ClassComponent;
}
