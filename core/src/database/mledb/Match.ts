import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,} from "typeorm";
import {Fixture} from "./Fixture";
import {Season} from "./Season";

@Index("match_pkey", ["id"], {unique: true})
@Index("match_season_match_number_unique", ["matchNumber", "season"], {
    unique: true,
})
@Entity("match", {schema: "public"})
export class Match {
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

    @Column("integer", {name: "season", unique: true})
    season: number;

    @Column("integer", {name: "match_number", unique: true})
    matchNumber: number;

    @Column("character varying", {
        name: "map",
        length: 255,
        default: () => "'CHAMPIONS_FIELD'",
    })
    map: string;

    @OneToMany(() => Fixture, (fixture) => fixture.match)
    fixtures: Fixture[];

    @ManyToOne(() => Season, (season) => season.matches, {onUpdate: "CASCADE"})
    @JoinColumn([{name: "season", referencedColumnName: "seasonNumber"}])
    season2: Season;
}
