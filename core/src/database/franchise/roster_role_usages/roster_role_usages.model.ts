import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {Player} from "$db/franchise/player/player.model";
import {RosterRole} from "$db/franchise/roster_role/roster_role.model";
import {Team} from "$db/franchise/team/team.model";

import {BaseModel} from "../../base-model";
import {Match} from "../../scheduling/match/match.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class RosterRoleUsage extends BaseModel {
    @ManyToOne(() => Team)
    @Field(() => Team)
  team: Team;

    @ManyToOne(() => Player)
    @Field(() => Player)
  player: Player;

    @ManyToOne(() => RosterRole)
    @Field(() => RosterRole)
  rosterRole: RosterRole;

    @ManyToOne(() => Match)
    @Field(() => Match)
  match: Match;
}
