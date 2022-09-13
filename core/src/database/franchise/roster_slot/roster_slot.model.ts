import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Player} from "../player";
import {RosterRole} from "../roster_role";
import {Team} from "../team";

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
