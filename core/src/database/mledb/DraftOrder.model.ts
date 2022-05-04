import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from "typeorm";
import {MLE_Season} from "./Season.model";

@Index("draft_order_pkey", ["id"], {unique: true})
@Index(
    "draft_order_season_season_number_league_round_pick_unique",
    ["league", "pick", "round", "seasonSeasonNumber"],
    {unique: true}
)
@Entity("draft_order", {schema: "mledb"})
export class MLE_DraftOrder {
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

    @Column("integer", {name: "season_season_number", unique: true})
    seasonSeasonNumber: number;

    @Column("character varying", {name: "original_team_name", length: 255})
    originalTeamName: string;

    @Column("character varying", {name: "team_name", length: 255})
    teamName: string;

    @Column("text", {name: "league", unique: true})
    league: string;

    @Column("integer", {name: "round", unique: true})
    round: number;

    @Column("integer", {name: "pick", unique: true})
    pick: number;

    @ManyToOne(() => MLE_Season, (season) => season.draftOrders, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([
        {name: "season_season_number", referencedColumnName: "seasonNumber"},
    ])
    seasonSeasonNumber2: MLE_Season;
}
