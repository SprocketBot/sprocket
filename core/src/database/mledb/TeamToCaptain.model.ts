import {Column, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {Player} from "./Player.model";

@Index("team_to_captain_pkey", ["id"], {unique: true})
@Index("team_to_captain_team_name_league_unique", ["league", "teamName"], {
    unique: true,
})
@Index("team_to_captain_player_id_unique", ["playerId"], {unique: true})
@Entity("team_to_captain", {schema: "public"})
export class TeamToCaptain {
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

    @Column("character varying", {name: "team_name", unique: true, length: 255})
    teamName: string;

    @Column("character varying", {
        name: "league",
        unique: true,
        length: 255,
        default: () => "'UNKNOWN'",
    })
    league: string;

    @OneToOne(() => Player, (player) => player.teamToCaptain, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "player_id", referencedColumnName: "id"}])
    player: Player;
}
