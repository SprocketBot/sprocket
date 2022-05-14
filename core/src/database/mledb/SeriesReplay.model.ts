import {
    Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_EloData} from "./EloData.model";
import type {Map} from "./enums/Map.enum";
import {MLE_PlayerStats} from "./PlayerStats.model";
import {MLE_PlayerStatsCore} from "./PlayerStatsCore.model";
import {MLE_Series} from "./Series.model";
import {MLE_TeamCoreStats} from "./TeamCoreStats.model";

@Index("series_replay_match_guid_unique", ["duration", "matchGuid"], {
    unique: true,
})
@Index("series_replay_pkey", ["id"], {unique: true})
@Entity("series_replay", {schema: "mledb"})
export class MLE_SeriesReplay {
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
        name: "map", nullable: true, length: 255,
    })
    map: Map | null;

    @Column("character varying", {
        name: "match_guid",
        nullable: true,
        length: 255,
    })
    matchGuid: string | null;

    @Column("character varying", {
        name: "ballchasing_id",
        nullable: true,
        length: 255,
    })
    ballchasingId: string | null;

    @Column("integer", {name: "duration"})
    duration: number;

    @Column("boolean", {name: "ncp", default: () => "false"})
    ncp: boolean;

    @Column("boolean", {name: "overtime"})
    overtime: boolean;

    @Column("integer", {name: "overtime_seconds", default: 0})
    overtimeSeconds: number;

    @Column("character varying", {
        name: "winning_team_name",
        nullable: true,
        length: 255,
    })
    winningTeamName: string | null;

    @Column("text", {name: "winning_color", nullable: true})
    winningColor: string | null;

    @Column("timestamp with time zone", {name: "played", nullable: true})
    played: Date | null;

    @Column("boolean", {name: "is_dummy", default: () => "false"})
    isDummy: boolean;

    @OneToMany(() => MLE_EloData, eloData => eloData.replay)
    eloData: MLE_EloData[];

    @OneToMany(() => MLE_PlayerStats, playerStats => playerStats.replay)
    playerStats: MLE_PlayerStats[];

    @OneToMany(() => MLE_PlayerStatsCore, playerStatsCore => playerStatsCore.replay)
    playerStatsCores: MLE_PlayerStatsCore[];

    @ManyToOne(() => MLE_Series, series => series.seriesReplays, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "series_id", referencedColumnName: "id"} ])
    series: MLE_Series;

    @OneToMany(() => MLE_TeamCoreStats, teamCoreStats => teamCoreStats.replay)
    teamCoreStats: MLE_TeamCoreStats[];
}
