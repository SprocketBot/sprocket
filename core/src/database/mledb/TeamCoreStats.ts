import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {SeriesReplay} from "./SeriesReplay";

@Index("team_core_stats_pkey", ["id"], {unique: true})
@Entity("team_core_stats", {schema: "public"})
export class TeamCoreStats {
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
        name: "team_name",
        nullable: true,
        length: 255,
    })
    teamName: string | null;

    @Column("character varying", {name: "color", nullable: true, length: 255})
    color: string | null;

    @Column("integer", {name: "goals", nullable: true})
    goals: number | null;

    @Column("integer", {name: "goals_against", nullable: true})
    goalsAgainst: number | null;

    @Column("integer", {name: "possession_time", nullable: true})
    possessionTime: number | null;

    @Column("integer", {name: "time_in_side", nullable: true})
    timeInSide: number | null;

    @ManyToOne(() => SeriesReplay, (seriesReplay) => seriesReplay.teamCoreStats, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "replay_id", referencedColumnName: "id"}])
    replay: SeriesReplay;
}
