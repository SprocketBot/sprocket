export * from './effect';
export * from './user';
export * from './platform';

export enum AuthAction {
  View = 'VIEW',
}
export enum AuthTarget {
  GraphQLPlayground = 'GraphQLPlayground',
  PermissionsManager = 'PermissionsManager',
}
export enum AuthScope {}

const AuthTargetActionMap = {
  [AuthTarget.GraphQLPlayground]: [AuthAction.View],
  [AuthTarget.PermissionsManager]: [],
};

export type ActionsForTarget<Target extends AuthTarget> =
  (typeof AuthTargetActionMap)[Target] extends Array<AuthAction>
    ? (typeof AuthTargetActionMap)[Target]
    : never;
