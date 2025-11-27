import {
    Field, Float, Int, ObjectType,
} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import { BaseModel } from "../../base-model";
import { Member } from "../../organization/member/member.model";
import { GameSkillGroup } from "../game_skill_group";
import { RosterSlot } from "../roster_slot";

@Entity({ schema: "sprocket" })
@ObjectType()
export class Player extends BaseModel {
    @ManyToOne(() => Member, m => m.players)
    @JoinColumn()
    @Field(() => Member)
    member: Member;

    @ManyToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @Column()
    @Field(() => Int)
    skillGroupId: number;

    @Column({ type: "float" })
    @Field(() => Float)
    salary: number;

    @OneToOne(() => RosterSlot, rs => rs.player, { nullable: true })
    @Field(() => RosterSlot, { nullable: true })
    slot?: RosterSlot;

    @Field(() => String)
    franchiseName: string;

    @Field(() => [String])
    franchisePositions: string[];
}
