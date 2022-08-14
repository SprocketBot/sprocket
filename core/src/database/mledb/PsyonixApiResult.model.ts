import {
    Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_PlayerAccount} from "./PlayerAccount.model";

@Index("psyonix_api_result_pkey", ["id"], {unique: true})
@Entity("psyonix_api_result")
export class MLE_PsyonixApiResult {
    @PrimaryGeneratedColumn({type: "integer", name: "id"})
    id: number;

    @Column("timestamp with time zone", {name: "timestamp"})
    timestamp: Date;

    @Column("integer", {name: "playlist"})
    playlist: number;

    @Column("integer", {name: "tier"})
    tier: number;

    @Column("integer", {name: "division"})
    division: number;

    @Column("numeric", {name: "skill"})
    skill: number;

    @Column("integer", {name: "matches_played"})
    matchesPlayed: number;

    @Column("integer", {name: "win_streak"})
    winStreak: number;

    @Column("numeric", {name: "sigma"})
    sigma: number;

    @Column("numeric", {name: "mu"})
    mu: number;

    @ManyToOne(
        () => MLE_PlayerAccount,
        {onUpdate: "CASCADE"},
    )
    @JoinColumn([ {name: "player_account_id", referencedColumnName: "id"} ])
    playerAccount: MLE_PlayerAccount;
}
