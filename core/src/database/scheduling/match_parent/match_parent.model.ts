import {Field, ObjectType} from "@nestjs/graphql";
import {
    Entity, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {Match} from "../match";
import {ScrimMeta} from "../saved_scrim";
import {ScheduleFixture} from "../schedule_fixture";
import {ScheduledEvent} from "../scheduled_event";

@Entity({schema: "sprocket"})
@ObjectType()
export class MatchParent extends BaseModel {
    @ManyToOne(() => ScheduledEvent, {nullable: true})
    @Field(() => ScheduledEvent, {nullable: true})
    event?: ScheduledEvent;

    @OneToOne(() => ScrimMeta, {nullable: true})
    @Field(() => ScrimMeta, {nullable: true})
    @JoinColumn()
    scrimMeta?: ScrimMeta;

    @ManyToOne(() => ScheduleFixture, {nullable: true})
    @Field(() => ScheduleFixture, {nullable: true})
    fixture?: ScheduleFixture;

    @OneToOne(() => Match, m => m.matchParent)
    @Field(() => Match)
    match: Match;
}
