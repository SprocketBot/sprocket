import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, ManyToOne, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {Franchise} from "../../franchise/models";
import {Match} from "../match";
import {MatchParent} from "../match_parent";
import {ScheduleGroup} from "../schedule_group";

@Entity({schema: "sprocket"})
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

    @OneToMany(() => MatchParent, mp => mp.fixture)
    matchParents: MatchParent[];

    @Field(() => [Match])
    matches: Match[];

    @Column()
    awayFranchiseId: number;

    @Column()
    homeFranchiseId: number;
}
