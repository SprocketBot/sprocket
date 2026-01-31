import {
    Column, Entity, Index, OneToMany, PrimaryGeneratedColumn,
} from "typeorm";

import {League} from "./enums/League.enum";
import {ModePreference} from "./enums/ModePreference.enum";
import type {Role} from "./enums/Role.enum";
import {Timezone} from "./enums/Timezone.enum";
import {MLE_PlayerAccount} from "./PlayerAccount.model";
import {MLE_PlayerToOrg} from "./PlayerToOrg.model";

@Index("player_pkey", ["id"], {unique: true})
@Index("player_mleid_index", ["mleid"], {})
@Index("player_name_unique", ["name"], {unique: true})
@Entity("player", {schema: "mledb"})
export class MLE_Player {
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

    @Column("integer", {name: "mleid"})
  mleid: number;

    @Column("character varying", {
        name: "name",
        unique: true,
        length: 255,
    })
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
  modePreference: ModePreference;

    @Column("boolean", {name: "suspended", default: () => "false"})
  suspended: boolean;

    @OneToMany(() => MLE_PlayerAccount, playerAccount => playerAccount.player)
  accounts: MLE_PlayerAccount[];

    @OneToMany(() => MLE_PlayerToOrg, playerToOrg => playerToOrg.player)
  playerOrgs: MLE_PlayerToOrg[];
}
