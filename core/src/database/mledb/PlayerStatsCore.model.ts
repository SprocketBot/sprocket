import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Player} from "./Player.model";
import {MLE_PlayerStats} from "./PlayerStats.model";
import {MLE_SeriesReplay} from "./SeriesReplay.model";

@Index("player_stats_core_pkey", ["id"], {unique: true})
@Entity("player_stats_core", {schema: "mledb"})
export class MLE_PlayerStatsCore {
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

    @Column("integer", {name: "goals_against", nullable: true})
  goals_against: number;

    @Column("integer", {name: "shots_against", nullable: true})
  shots_against: number;

    @Column("boolean", {name: "mvp"})
  mvp: boolean;

    @Column("real", {name: "mvpr"})
  mvpr: number;

    @Column("real", {name: "opi", nullable: true})
  opi: number;

    @Column("real", {name: "dpi", nullable: true})
  dpi: number;

    @Column("real", {name: "gpi", nullable: true})
  gpi: number;

    @OneToOne(() => MLE_PlayerStats, playerStats => playerStats.coreStats)
  playerStats: MLE_PlayerStats;

    @ManyToOne(() => MLE_Player, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "player_id", referencedColumnName: "id"} ])
  player: MLE_Player;

    @ManyToOne(() => MLE_SeriesReplay, seriesReplay => seriesReplay.playerStatsCores, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "replay_id", referencedColumnName: "id"} ])
  replay: MLE_SeriesReplay;
}
