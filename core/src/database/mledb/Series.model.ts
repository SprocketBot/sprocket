import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {MLE_Fixture} from "./Fixture.model";
import {MLE_Scrim} from "./Scrim.model";
import {MLE_SeriesReplay} from "./SeriesReplay.model";
import {MLE_StreamEvent} from "./StreamEvent.model";
import {MLE_TeamRoleUsage} from "./TeamRoleUsage.model";
import {Mode} from "./enums/Mode.enum";

@Index(
    "series_league_fixture_id_mode_unique",
    ["fixtureId", "league", "mode"],
    {unique: true}
)
@Index("series_pkey", ["id"], {unique: true})
@Index("series_scrim_id_unique", ["scrimId"], {unique: true})
@Entity("series", {schema: "mledb"})
export class MLE_Series {
    @PrimaryGeneratedColumn({type: "integer", name: "id"})
    id: number;

    @Column("character varying", {
        name: "created_by",
        length: 255,
        default: () => "'Unknown'",
    })
    createdBy: string;

    @Column("timestamp without time zone", {
        name: "created_at",
        default: () => "now()",
    })
    createdAt: Date;

    @Column("character varying", {
        name: "updated_by",
        length: 255,
        default: () => "'Unknown'",
    })
    updatedBy: string;

    @Column("timestamp without time zone", {
        name: "updated_at",
        default: () => "now()",
    })
    updatedAt: Date;

    @Column("character varying", {
        name: "league",
        length: 255,
        default: () => "'UNKNOWN'",
    })
    league: string;

    @Column("timestamp with time zone", {
        name: "submission_timestamp",
        nullable: true,
    })
    submissionTimestamp: Date | null;

    @Column("timestamp with time zone", {
        name: "scheduled_time",
        nullable: true,
    })
    scheduledTime: Date | null;

    @Column("boolean", {name: "full_ncp", default: () => "false"})
    fullNcp: boolean;

    @Column("text", {name: "mode"})
    mode: Mode;

    @Column("integer", {name: "fixture_id", nullable: true})
    fixtureId: number | null;

    @Column("integer", {name: "scrim_id", nullable: true})
    scrimId: number | null;

    @Column("character varying", {
        name: "stream_event_message_id",
        nullable: true,
        length: 255,
    })
    streamEventMessageId: string | null;

    @ManyToOne(() => MLE_Fixture, (fixture) => fixture.series, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "fixture_id", referencedColumnName: "id"}])
    fixture: MLE_Fixture;

    @OneToOne(() => MLE_Scrim, (scrim) => scrim.series, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "scrim_id", referencedColumnName: "id"}])
    scrim: MLE_Scrim;

    @OneToMany(() => MLE_SeriesReplay, (seriesReplay) => seriesReplay.series)
    seriesReplays: MLE_SeriesReplay[];

    @OneToOne(() => MLE_StreamEvent, (streamEvent) => streamEvent.series)
    streamEvent: MLE_StreamEvent;

    @OneToMany(() => MLE_TeamRoleUsage, (teamRoleUsage) => teamRoleUsage.series)
    teamRoleUsages: MLE_TeamRoleUsage[];
}
