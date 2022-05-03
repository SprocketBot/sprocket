import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, ManyToOne, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Franchise} from "../../franchise/franchise";
import {MatchParent} from "../match_parent";
import {ScheduleGroup} from "../schedule_group";
@Entity({ schema: "sprocket" })
@ObjectType()
export class ScheduleFixture extends BaseModel {
    @ManyToOne(() => ScheduleGroup)
    @Field(() => ScheduleGroup)
    scheduleGroup: ScheduleGroup;

    @ManyToOne(() => Franchise)
    @Field(() => Franchise)
    homeFranchise: Franchise;

    @ManyToOne(() => Franchise)
    @Field(() => Franchise)
    awayFranchise: Franchise;

    @OneToOne(() => MatchParent)
    @Field(() => MatchParent)
    matchParent: MatchParent;
}
