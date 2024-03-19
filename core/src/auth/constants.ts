import {
  AuthTarget,
  AuthScope,
  AuthAction,
  Resolvable,
  AuthEffect,
  User,
} from '@sprocketbot/lib/types';
import type { Request } from 'express';

export type AuthorizationSpec =
  | {
      target: AuthTarget;
      action: AuthAction;
      scope: Exclude<AuthScope, 'all'>;
      inScope: (user: User, request: Request) => Promise<boolean> | boolean;
    }
  | {
      scope: AuthScope.ALL;
      target: AuthTarget;
      action: AuthAction;
      inScope?: (user: User, request: Request) => Promise<boolean> | boolean;
    };
export type AuthorizationInput = Resolvable<AuthorizationSpec, [], void>;

export type AuthSubject = string;
export type AuthTenant = string;

export type CasbinAuthPolicy = [
  AuthSubject,
  AuthTenant,
  AuthTarget,
  AuthAction,
  AuthScope,
  AuthEffect,
];

// Policies
// subject object action scope effect

// subject            tenant    object (target)    Action     Scope             Effect
// shuckle,           Sprocket, Scrims,            Join,      SELF,             ALLOW

// player,            Sprocket, Scrims,            Create,    OWN_SKILL_GROUP,  ALLOW
// player,            Sprocket, Scrims,            Read,      OWN_SKILL_GROUP,  ALLOW
// player,            Sprocket, Scrims,            Join,      OWN_SKILL_GROUP,  ALLOW
// player,            Sprocket, Scrims,            Upload,    OWN_SKILL_GROUP,  ALLOW
// player,            Sprocket, Scrims,            Ratify,    OWN_SKILL_GROUP,  ALLOW
// player,            Sprocket, Scrims,            Ratify,    SELF,             DENY

// scout,             Sprocket, Scrims,            Read,      OWN_ORGANIZATION, ALLOW

// franchise_manager, Sprocket, LeaguePlay,        Upload,    OWN_FRANCHISE,    ALLOW

// Franchise Manager can ratify replays they did not upload (for their franchise)
// franchise_manager, Sprocket, LeaguePlay,        Ratify,    OWN_FRANCHISE,    ALLOW
// franchise_manager, Sprocket, LeaguePlay,        Ratify,    SELF,             DENY

// league_ops,        Sprocket, LeaguePlay,        Upload,    OWN_ORGANIZATION, ALLOW

// whoever,           Sprocket, RoleConfig,        Admin,     OWN_ORGANIZATION, ALLOW
