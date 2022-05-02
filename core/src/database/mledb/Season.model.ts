import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn,} from "typeorm";
import {DraftOrder} from "./DraftOrder.model";
import {Match} from "./Match.model";

@Index("season_pkey", ["seasonNumber"], {unique: true})
@Entity("season", {schema: "public"})
export class Season {
    @PrimaryGeneratedColumn({type: "integer", name: "season_number"})
    seasonNumber: number;

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

    @Column("timestamp with time zone", {name: "start_date"})
    startDate: Date;

    @Column("timestamp with time zone", {name: "end_date"})
    endDate: Date;

    @Column("boolean", {name: "roster_locked", default: () => "false"})
    rosterLocked: boolean;

    @Column("integer", {name: "week_length", default: () => "7"})
    weekLength: number;

    @OneToMany(() => DraftOrder, (draftOrder) => draftOrder.seasonSeasonNumber2)
    draftOrders: DraftOrder[];

    @OneToMany(() => Match, (match) => match.season2)
    matches: Match[];
}
