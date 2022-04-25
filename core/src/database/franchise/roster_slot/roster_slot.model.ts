import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, ManyToOne, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Player} from "../player";
import {RosterRole} from "../roster_role";
import {Team} from "../team";
@Entity()
@ObjectType()
export class RosterSlot extends BaseModel {
    @ManyToOne(() => RosterRole)
    @Field(() => RosterRole)
    role: RosterRole;

    @ManyToOne(() => Team)
    @Field(() => Team)
    team: Team;

    @OneToOne(() => Player)
    @Field(() => Player)
    player: Player;
}
