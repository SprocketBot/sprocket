import { Resolvable, AuthEffect, AuthAction } from '@sprocketbot/lib/types';

export type AuthorizationSpec = {
  action: AuthAction;
};
export type AuthorizationInput = Resolvable<AuthorizationSpec, [], void>;

export type CasbinAuthPolicy = [AuthAction, AuthEffect];

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
