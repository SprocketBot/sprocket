import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Index("salary_cap_pkey", ["id"], {unique: true})
@Index("salary_cap_league_unique", ["league"], {unique: true})
@Entity("salary_cap", {schema: "public"})
export class SalaryCap {
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

    @Column("character varying", {name: "league", unique: true, length: 255})
    league: string;

    @Column("real", {name: "max_salary"})
    maxSalary: number;
}
