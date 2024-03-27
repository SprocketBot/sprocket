import {
  type Output,
  array,
  boolean,
  enum_,
  object,
  optional,
  string,
} from 'valibot';

export const UserSchema = object({
  id: string(),
  username: string(),
  active: boolean(),
  avatarUrl: optional(string()),
});

export type User = Output<typeof UserSchema>;
