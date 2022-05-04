import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Match} from "../../scheduling/match/match.model";
import {Player} from "../player";
import {RosterRole} from "../roster_role";
import {Team} from "../team";
@Entity({ schema: "sprocket" })
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
