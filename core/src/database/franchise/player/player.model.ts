import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Member} from "../../organization/member";
import {GameSkillGroup} from "../game_skill_group";
import {RosterSlot} from "../roster_slot";

@Entity({schema: "sprocket"})
@ObjectType()
export class Player extends BaseModel {
    @ManyToOne(() => Member)
    @Field(() => Member)
    member: Member;

    @ManyToOne(() => GameSkillGroup)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @Column()
    @Field(() => Number)
    salary: number;

    @OneToOne(() => RosterSlot, {nullable: true})
    @Field(() => RosterSlot, {nullable: true})
    slot?: RosterSlot;
}
