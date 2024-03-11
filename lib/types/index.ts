export * from './auth';

export type Resolvable<T, Args extends any[] = never> =
  | T
  | Promise<T>
  | ((...args: Args) => T | Promise<T>);
