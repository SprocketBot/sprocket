import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {Match} from "";
import {ScheduleFixture} from "";
import {ScheduledEvent} from "";
import {ScrimMeta} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class MatchParent extends BaseEntity {
    @ManyToOne(() => ScheduledEvent, {nullable: true})
    event?: ScheduledEvent;

    @OneToOne(() => ScrimMeta, {nullable: true})
    @JoinColumn()
    scrimMeta?: ScrimMeta;

    @ManyToOne(() => ScheduleFixture, {nullable: true})
    fixture?: ScheduleFixture;

    @OneToOne(() => Match, m => m.matchParent)
    match: Match;
}