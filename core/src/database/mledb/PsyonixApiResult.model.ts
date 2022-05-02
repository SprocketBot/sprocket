import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {PlayerAccount} from "./PlayerAccount.model";

@Index("psyonix_api_result_pkey", ["id"], {unique: true})
@Entity("psyonix_api_result", {schema: "public"})
export class PsyonixApiResult {
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

    @Column("integer", {name: "skill"})
    skill: number;

    @Column("integer", {name: "matches_played"})
    matchesPlayed: number;

    @Column("integer", {name: "win_streak"})
    winStreak: number;

    @Column("integer", {name: "sigma"})
    sigma: number;

    @Column("integer", {name: "mu"})
    mu: number;

    @ManyToOne(
        () => PlayerAccount,
        (playerAccount) => playerAccount.psyonixApiResults,
        {onUpdate: "CASCADE"}
    )
    @JoinColumn([{name: "player_account_id", referencedColumnName: "id"}])
    playerAccount: PlayerAccount;
}
