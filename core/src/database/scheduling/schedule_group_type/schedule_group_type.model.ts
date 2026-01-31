import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, ManyToOne, OneToMany,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Organization} from "../../organization/organization/organization.model";
import {ScheduleGroup} from "../schedule_group/schedule_group.model";

@Entity({schema: "sprocket"})
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
