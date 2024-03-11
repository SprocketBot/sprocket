import { UserDescription } from '../utils';

export enum AuthScope {
  ALL = 'all',
  SELF = 'self',
  OWN_FRANCHISE = 'own-franchise',
  OWN_TEAM = 'own-team',
  OWN_SKILL_GROUP = 'own-skill-group',
  OWN_ORGANIZATION = 'own-org',
}
export const toAuthScope = (x: string): AuthScope | null => {
  const entry = Object.entries(AuthScope).find(([, v]) => v === x);
  return entry[1] ?? null;
};

export const AuthScopeDescriptions: UserDescription<AuthScope> = {
  [AuthScope.ALL]: {
    title: 'All',
    description: 'User can operator on all objects',
  },
  [AuthScope.SELF]: {
    title: 'Self',
    description: 'Operations on personally-owned objects',
  },
  [AuthScope.OWN_ORGANIZATION]: {
    title: 'Own Organization',
    description: 'User can operate on all objects within their organization',
  },
  [AuthScope.OWN_FRANCHISE]: {
    title: '',
    description: '',
  },
  [AuthScope.OWN_TEAM]: {
    title: '',
    description: '',
  },
  [AuthScope.OWN_SKILL_GROUP]: {
    title: '',
    description: '',
  },
};
export const AuthScopeImplicits: Record<AuthScope, AuthScope[]> = {
  [AuthScope.ALL]: Object.values(AuthScope),
  [AuthScope.SELF]: [],
  [AuthScope.OWN_FRANCHISE]: [AuthScope.OWN_TEAM],
  [AuthScope.OWN_TEAM]: [AuthScope.SELF],
  [AuthScope.OWN_ORGANIZATION]: [
    AuthScope.OWN_FRANCHISE,
    AuthScope.OWN_TEAM,
    AuthScope.SELF,
  ],
  [AuthScope.OWN_SKILL_GROUP]: [],
};
