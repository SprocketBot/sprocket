export type DataOnly<T> = {
  [K in {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [P in keyof T]: T[P] extends string | number | boolean | Date ? P : never;
  }[keyof T]]: T[K];
};
