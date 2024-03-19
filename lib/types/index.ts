export * from './auth';
export * from './connectors';
export * from './scrim';

/**
 * Literal or function that returns literal
 */
export type Resolvable<T, Args extends any[] = never, This = never> =
  | T
  | Promise<T>
  | ((this: This, ...args: Args) => T | Promise<T>);

/**
 * Narrows propery keys to function values only
 */
export type FunctionProperty<Target> = {
  [Key in keyof Target as Target[Key] extends CallableFunction
    ? Key
    : never]: Target[Key];
};

export type SomeFunction = (...args: any[]) => any;
export type ParamsIfFunction<T> = T extends SomeFunction
  ? Parameters<T>
  : never;
export type DecoratorReturn<TargetClass, TargetProperty> = <T>(
  target: TargetClass,
  propertyKey: TargetProperty,
  descriptor: TypedPropertyDescriptor<T>,
) => void | TypedPropertyDescriptor<T>;
