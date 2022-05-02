import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,} from "typeorm";
import {Player} from "./Player.model";
import {PsyonixApiResult} from "./PsyonixApiResult.model";

@Index("player_account_pkey", ["id"], {unique: true})
@Index(
    "player_account_platform_id_platform_unique",
    ["platform", "platformId"],
    {unique: true}
)
@Index("player_account_tracker_unique", ["tracker"], {unique: true})
@Entity("player_account", {schema: "public"})
export class PlayerAccount {
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

    @Column("character varying", {name: "platform", unique: true, length: 255})
    platform: string;

    @Column("character varying", {
        name: "tracker",
        nullable: true,
        unique: true,
        length: 255,
    })
    tracker: string | null;

    @Column("text", {
        name: "platform_id",
        nullable: true,
        unique: true,
        default: () => "''",
    })
    platformId: string | null;

    @ManyToOne(() => Player, (player) => player.playerAccounts, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "player_id", referencedColumnName: "id"}])
    player: Player;

    @OneToMany(
        () => PsyonixApiResult,
        (psyonixApiResult) => psyonixApiResult.playerAccount
    )
    psyonixApiResults: PsyonixApiResult[];
}
