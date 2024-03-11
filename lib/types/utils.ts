export type UserDescription<T extends string> = Record<
  T,
  { title: string; description: string }
>;
