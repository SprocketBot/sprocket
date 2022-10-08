import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

import {League} from "./enums/League.enum";
import type {Role} from "./enums/Role.enum";
import {Timezone} from "./enums/Timezone.enum";

@Index("player_history_pkey", ["historyId"], {unique: true})
@Index("player_history_mleid_index", ["mleid"], {})
@Entity("player_history", {schema: "mledb"})
export class MLE_PlayerHistory {
    @PrimaryGeneratedColumn({type: "integer", name: "history_id"})
    historyId: number;

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

    @Column("integer", {name: "mleid"})
    mleid: number;

    @Column("character varying", {name: "name", length: 255})
    name: string;

    @Column("real", {name: "salary", default: -1})
    salary: number;

    @Column("character varying", {
        name: "team_name",
        length: 255,
        default: () => "'FA'",
    })
    teamName: string;

    @Column("character varying", {
        name: "league",
        length: 255,
        default: () => "'UNKNOWN'",
    })
    league: League;

    @Column("character varying", {
        name: "role",
        nullable: true,
        length: 255,
    })
    role: Role | null;

    @Column("character varying", {
        name: "preferred_platform",
        nullable: true,
        length: 255,
    })
    preferredPlatform: string | null;

    @Column("integer", {
        name: "peak_mmr",
        nullable: true,
        default: 0,
    })
    peakMmr: number | null;

    @Column("character varying", {
        name: "timezone",
        length: 255,
        default: () => "'UNKNOWN'",
    })
    timezone: Timezone;

    @Column("character varying", {
        name: "discord_id",
        nullable: true,
        length: 255,
    })
    discordId: string | null;

    @Column("text", {name: "mode_preference", default: () => "'BOTH'"})
    modePreference: string;

    @Column("timestamp without time zone", {
        name: "timestamp",
        default: () => "now()",
    })
    timestamp: Date;

    @Column("boolean", {name: "suspended", default: () => "false"})
    suspended: boolean;
}
