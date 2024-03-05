import type { Request } from 'express';

export enum AuthTarget {
  USER = 'User',
}
export enum AuthAction {
  READ = 'read',
}
export enum AuthScope {
  ALL = 'all',
  SELF = 'self',
}

export type AuthorizationSpec =
  | {
      target: AuthTarget;
      action: AuthAction;
      scope: Exclude<AuthScope, 'all'>;
      inScope: (
        user: Express.User,
        request: Request,
      ) => Promise<boolean> | boolean;
    }
  | {
      scope: AuthScope.ALL;
      target: AuthTarget;
      action: AuthAction;
    };
export type AuthorizationInput =
  | AuthorizationSpec
  | Promise<AuthorizationSpec>
  | (() => AuthorizationSpec)
  | (() => Promise<AuthorizationSpec>);
