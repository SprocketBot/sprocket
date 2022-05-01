import {Column, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {EligibilityData} from "./EligibilityData";
import {EloData} from "./EloData";
import {PlayerAccount} from "./PlayerAccount";
import {PlayerStats} from "./PlayerStats";
import {PlayerStatsCore} from "./PlayerStatsCore";
import {PlayerToOrg} from "./PlayerToOrg";
import {Scrim} from "./Scrim";
import {Team} from "./Team";
import {TeamToCaptain} from "./TeamToCaptain";
import {ModePreference} from "./enums/ModePreference.enum";
import {Role} from "./enums/Role.enum";
import {Timezone} from "./enums/Timezone.enum";
import {League} from "./enums/League.enum";

@Index("player_pkey", ["id"], {unique: true})
@Index("player_mleid_index", ["mleid"], {})
@Index("player_name_unique", ["name"], {unique: true})
@Entity("player", {schema: "public"})
export class Player {
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

    @Column("character varying", {name: "name", unique: true, length: 255})
    name: string;

    @Column("real", {name: "salary", precision: 24, default: () => "'-1.0'"})
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

    @Column("character varying", {name: "role", nullable: true, length: 255})
    role: Role | null;

    @Column("character varying", {
        name: "preferred_platform",
        nullable: true,
        length: 255,
    })
    preferredPlatform: string | null;

    @Column("integer", {name: "peak_mmr", nullable: true, default: () => "0"})
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

    @OneToMany(() => EligibilityData, (eligibilityData) => eligibilityData.player)
    eligibilityData: EligibilityData[];

    @OneToMany(() => EloData, (eloData) => eloData.player)
    eloData: EloData[];

    @OneToMany(() => PlayerAccount, (playerAccount) => playerAccount.player)
    playerAccounts: PlayerAccount[];

    @OneToMany(() => PlayerStats, (playerStats) => playerStats.player)
    playerStats: PlayerStats[];

    @OneToMany(() => PlayerStatsCore, (playerStatsCore) => playerStatsCore.player)
    playerStatsCores: PlayerStatsCore[];

    @OneToMany(() => PlayerToOrg, (playerToOrg) => playerToOrg.player)
    playerToOrgs: PlayerToOrg[];

    @OneToMany(() => Scrim, (scrim) => scrim.author)
    scrims: Scrim[];

    @OneToMany(() => Scrim, (scrim) => scrim.host)
    scrims2: Scrim[];

    @OneToOne(() => Team, (team) => team.doublesAssistantGeneralManager)
    team: Team;

    @OneToOne(() => Team, (team) => team.franchiseManager)
    team2: Team;

    @OneToOne(() => Team, (team) => team.generalManager)
    team3: Team;

    @OneToOne(() => Team, (team) => team.prSupport)
    team4: Team;

    @OneToOne(() => Team, (team) => team.standardAssistantGeneralManager)
    team5: Team;

    @OneToOne(() => TeamToCaptain, (teamToCaptain) => teamToCaptain.player)
    teamToCaptain: TeamToCaptain;
}
