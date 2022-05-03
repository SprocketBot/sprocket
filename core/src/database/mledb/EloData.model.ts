import {Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {MLE_Player} from "./Player.model";
import {MLE_SeriesReplay} from "./SeriesReplay.model";

@Index("elo_data_pkey", ["id"], {unique: true})
@Index("elo_data_next_node_id_unique", ["nextNodeId"], {unique: true})
@Index("elo_data_player_id_replay_id_unique", ["playerId", "replayId"], {
    unique: true,
})
@Index("elo_data_previous_node_id_unique", ["previousNodeId"], {unique: true})
@Entity("elo_data", {schema: "mledb"})
export class MLE_EloData {
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

    @Column("integer", {name: "player_id", unique: true})
    playerId: number;

    @Column("integer", {name: "replay_id", nullable: true, unique: true})
    replayId: number | null;

    @Column("real", {name: "elo"})
    elo: number;

    @Column("integer", {name: "previous_node_id", nullable: true, unique: true})
    previousNodeId: number | null;

    @Column("integer", {name: "next_node_id", nullable: true, unique: true})
    nextNodeId: number | null;

    @Column("integer", {name: "chain", default: () => "0"})
    chain: number;

    @Column("character varying", {name: "league", nullable: true, length: 255})
    league: string | null;

    @OneToOne(() => MLE_EloData, (eloData) => eloData.previousNode, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "next_node_id", referencedColumnName: "id"}])
    nextNode: MLE_EloData;

    @OneToOne(() => MLE_EloData, (eloData) => eloData.nextNode, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "previous_node_id", referencedColumnName: "id"}])
    previousNode: MLE_EloData;

    @ManyToOne(() => MLE_SeriesReplay, (seriesReplay) => seriesReplay.eloData, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "replay_id", referencedColumnName: "id"}])
    replay: MLE_SeriesReplay;

    @ManyToOne(() => MLE_Player, {onUpdate: "CASCADE"})
    @JoinColumn([{name: "player_id", referencedColumnName: "id"}])
    player: MLE_Player;
}
