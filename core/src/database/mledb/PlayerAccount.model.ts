import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Platform} from "./enums";
import {MLE_Player} from "./Player.model";

@Index("player_account_pkey", ["id"], {unique: true})
@Index(
    "player_account_platform_id_platform_unique",
    ["platform", "platformId"],
    {unique: true},
)
@Index("player_account_tracker_unique", ["tracker"], {unique: true})
@Entity("player_account", {schema: "mledb"})
export class MLE_PlayerAccount {
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

    @Column("character varying", {name: "platform", length: 255})
    platform: MLE_Platform;

    @Column("character varying", {
        name: "tracker",
        nullable: true,
        length: 255,
    })
    tracker: string | null;

    @Column("text", {
        name: "platform_id",
        nullable: true,
        default: () => "''",
    })
    platformId: string | null;

    @ManyToOne(() => MLE_Player, player => player.accounts, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "player_id", referencedColumnName: "id"}])
    player: MLE_Player;
}
