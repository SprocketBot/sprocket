import {
    Column, Entity, Index, PrimaryGeneratedColumn,
} from "typeorm";

import {League} from "./enums/League.enum";

@Index("league_branding_pkey", ["id"], {unique: true})
@Index("league_branding_league_unique", ["league"], {unique: true})
@Entity("league_branding", {schema: "mledb"})
export class MLE_LeagueBranding {
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

    @Column("character varying", {
        name: "league", unique: true, length: 255,
    })
    league: League;

    @Column("character varying", {name: "color", length: 255})
    color: string;

    @Column("character varying", {name: "badge_img_link", length: 255})
    badgeImgLink: string;

    @Column("character varying", {
        name: "discord_emoji_id",
        nullable: true,
        length: 255,
    })
    discordEmojiId: string | null;
}
