import {
    Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Fixture} from "./Fixture.model";
import {MLE_Season} from "./Season.model";

@Index("match_pkey", ["id"], {unique: true})
@Index("match_season_match_number_unique", ["matchNumber", "season"], {
    unique: true,
})
@Entity("match", {schema: "mledb"})
export class MLE_Match {
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

    @Column("timestamp with time zone", {name: "from"})
    from: Date;

    @Column("timestamp with time zone", {name: "to"})
    to: Date;

    @Column("boolean", {name: "is_double_header"})
    isDoubleHeader: boolean;

    @Column("integer", {name: "match_number"})
    matchNumber: number;

    @Column("character varying", {
        name: "map",
        length: 255,
        default: () => "'CHAMPIONS_FIELD'",
    })
    map: string;

    @OneToMany(() => MLE_Fixture, fixture => fixture.match)
    fixtures: MLE_Fixture[];

    @ManyToOne(() => MLE_Season, season => season.matches, {onUpdate: "CASCADE"})
    @JoinColumn([ {name: "season", referencedColumnName: "seasonNumber"} ])
    season: MLE_Season;
}
