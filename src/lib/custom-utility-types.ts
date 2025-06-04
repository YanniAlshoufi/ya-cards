export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;
type LastOf<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Push<T extends any[], V> = [...T, V];

export type UnionToTuple<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : Push<UnionToTuple<Exclude<T, L>>, L>;
