import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/organization";
import {ScheduleGroup} from "../schedule_group";
@Entity({ schema: "sprocket" })
@ObjectType()
export class ScheduleGroupType extends BaseModel {
    @ManyToOne(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @Column()
    @Field(() => String)
    name: string;

    @Column()
    @Field(() => String)
    code: string;

    @OneToMany(() => ScheduleGroup, sg => sg.type)
    @Field(() => [ScheduleGroup])
    scheduleGroups: ScheduleGroup[];
}
