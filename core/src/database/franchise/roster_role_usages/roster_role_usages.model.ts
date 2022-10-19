import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Match} from "../../scheduling/match/match.model";
import {Player} from "../player/player.model";
import {RosterRole} from "../roster_role/roster_role.model";
import {Team} from "../team/team.model";

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
