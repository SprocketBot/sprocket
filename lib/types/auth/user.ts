import { Output, array, enum_, object, optional, string } from 'valibot';
import { AuthAction } from './action';
import { AuthScope } from './scope';
import { AuthTarget } from './target';

export const UserSchema = object({
  username: string(),
  avatarUrl: optional(string()),
  allowedActions: optional(
    array(
      object({
        target: enum_(AuthTarget),
        action: enum_(AuthAction),
        scope: enum_(AuthScope),
      }),
    ),
    [],
  ),
});

export type User = Output<typeof UserSchema>;
