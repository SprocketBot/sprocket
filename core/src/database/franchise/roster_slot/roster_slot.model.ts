import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import {Player} from "$db/franchise/player/player.model";
import {RosterRole} from "$db/franchise/roster_role/roster_role.model";
import {Team} from "$db/franchise/team/team.model";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@ObjectType()
export class RosterSlot extends BaseModel {
    @ManyToOne(() => RosterRole)
    @Field(() => RosterRole)
    @JoinColumn()
    role: RosterRole;

    @ManyToOne(() => Team)
    @Field(() => Team)
    @JoinColumn()
    team: Team;

    @OneToOne(() => Player, p => p.slot)
    @Field(() => Player)
    @JoinColumn()
    player: Player;
}
