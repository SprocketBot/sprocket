import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, ManyToOne, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {ScheduleGroupType} from "../../scheduling/schedule_group_type";
import {GameSkillGroup} from "../game_skill_group";

@Entity({schema: "sprocket"})
@ObjectType()
export class RosterRoleUseLimits extends BaseModel {
    @Column()
    @Field(() => String)
    code: string;

    @Column()
    @Field(() => Number)
    perMode: number;

    @Column()
    @Field(() => Number)
    total: number;

    @OneToOne(() => GameSkillGroup, gsg => gsg.roleUseLimits)
    @Field(() => GameSkillGroup)
    skillGroup: GameSkillGroup;

    @ManyToOne(() => ScheduleGroupType)
    @Field(() => ScheduleGroupType)
    groupType: ScheduleGroupType;
}
