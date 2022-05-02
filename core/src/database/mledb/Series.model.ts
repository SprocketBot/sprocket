import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {Fixture} from "./Fixture.model";
import {Scrim} from "./Scrim.model";
import {SeriesReplay} from "./SeriesReplay.model";
import {StreamEvent} from "./StreamEvent.model";
import {TeamRoleUsage} from "./TeamRoleUsage.model";
import {Mode} from "./enums/Mode.enum";

@Index(
    "series_league_fixture_id_mode_unique",
    ["fixtureId", "league", "mode"],
    {unique: true}
)
@Index("series_pkey", ["id"], {unique: true})
@Index("series_scrim_id_unique", ["scrimId"], {unique: true})
@Entity("series", {schema: "public"})
export class Series {
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
        unique: true,
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

    @Column("text", {name: "mode", unique: true})
    mode: Mode;

    @Column("integer", {name: "fixture_id", nullable: true, unique: true})
    fixtureId: number | null;

    @Column("integer", {name: "scrim_id", nullable: true, unique: true})
    scrimId: number | null;

    @Column("character varying", {
        name: "stream_event_message_id",
        nullable: true,
        length: 255,
    })
    streamEventMessageId: string | null;

    @ManyToOne(() => Fixture, (fixture) => fixture.series, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "fixture_id", referencedColumnName: "id"}])
    fixture: Fixture;

    @OneToOne(() => Scrim, (scrim) => scrim.series, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "scrim_id", referencedColumnName: "id"}])
    scrim: Scrim;

    @OneToMany(() => SeriesReplay, (seriesReplay) => seriesReplay.series)
    seriesReplays: SeriesReplay[];

    @OneToOne(() => StreamEvent, (streamEvent) => streamEvent.series)
    streamEvent: StreamEvent;

    @OneToMany(() => TeamRoleUsage, (teamRoleUsage) => teamRoleUsage.series)
    teamRoleUsages: TeamRoleUsage[];
}
