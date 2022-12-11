import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Match} from "./match.entity";
import {ScheduleFixture} from "./schedule-fixture.entity";
import {ScheduledEvent} from "./scheduled-event.entity";
import {ScrimMeta} from "./scrim-meta.entity";

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
