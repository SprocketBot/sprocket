import {Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {PlayerStats} from "./PlayerStats.model";
import {Player} from "./Player.model";
import {SeriesReplay} from "./SeriesReplay.model";

@Index("player_stats_core_pkey", ["id"], {unique: true})
@Entity("player_stats_core", {schema: "public"})
export class PlayerStatsCore {
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

    @Column("text", {name: "color"})
    color: string;

    @Column("integer", {name: "score"})
    score: number;

    @Column("integer", {name: "shots"})
    shots: number;

    @Column("integer", {name: "goals"})
    goals: number;

    @Column("integer", {name: "saves"})
    saves: number;

    @Column("integer", {name: "assists"})
    assists: number;

    @Column("boolean", {name: "mvp"})
    mvp: boolean;

    @Column("real", {name: "mvpr"})
    mvpr: number;

    @OneToOne(() => PlayerStats, (playerStats) => playerStats.coreStats)
    playerStats: PlayerStats;

    @ManyToOne(() => Player, (player) => player.playerStatsCores, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "player_id", referencedColumnName: "id"}])
    player: Player;

    @ManyToOne(
        () => SeriesReplay,
        (seriesReplay) => seriesReplay.playerStatsCores,
        {onUpdate: "CASCADE"}
    )
    @JoinColumn([{name: "replay_id", referencedColumnName: "id"}])
    replay: SeriesReplay;
}
