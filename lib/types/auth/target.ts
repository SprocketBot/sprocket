import { UserDescription } from '../utils';

export enum AuthTarget {
  // Entities
  USER = 'Entity__User',
  SCRIM = 'Entity__Scrim',
  // Views
  VIEW_GQL_PLAYGROUND = 'View__GQLPlayground',
  VIEW_ROLE_CONFIG = 'View__RoleConfig',
}

export const AuthTargetDescriptions: UserDescription<AuthTarget> = {
  [AuthTarget.USER]: {
    title: 'User',
    description: '',
  },
  [AuthTarget.SCRIM]: {
    title: 'Scrim',
    description: '',
  },
  [AuthTarget.VIEW_GQL_PLAYGROUND]: {
    title: 'GraphQL Playground',
    description: '',
  },
  [AuthTarget.VIEW_ROLE_CONFIG]: {
    title: 'Role Configuration',
    description: '',
  },
};

export const toAuthTarget = (x: string): AuthTarget | null => {
  const entry = Object.entries(AuthTarget).find(([, v]) => v === x);
  return entry[1] ?? null;
};
