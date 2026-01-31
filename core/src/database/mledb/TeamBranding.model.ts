import {
    Column, Entity, Index, OneToOne, PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Team} from "./Team.model";

@Index("team_branding_pkey", ["id"], {unique: true})
@Index("team_branding_team_name_unique", ["teamName"], {unique: true})
@Entity("team_branding", {schema: "mledb"})
export class MLE_TeamBranding {
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
        name: "team_name",
        unique: true,
        length: 255,
    })
  teamName: string;

    @Column("character varying", {name: "primary_color", length: 255})
  primaryColor: string;

    @Column("character varying", {name: "secondary_color", length: 255})
  secondaryColor: string;

    @Column("character varying", {name: "logo_img_link", length: 255})
  logoImgLink: string;

    @Column("character varying", {
        name: "discord_emoji_id",
        nullable: true,
        length: 255,
    })
  discordEmojiId: string | null;

    @OneToOne(() => MLE_Team, team => team.branding)
  team: MLE_Team;
}
