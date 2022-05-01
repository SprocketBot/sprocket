import {Column, Entity, Index, OneToMany} from "typeorm";
import {Team} from "./Team";
import {Conference} from "./enums/Conference.enum";

@Index("division_pkey", ["name"], {unique: true})
@Entity("division", {schema: "public"})
export class Division {
    @Column("character varying", {primary: true, name: "name", length: 255})
    name: string;

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

    @Column("text", {name: "conference"})
    conference: Conference;

    @OneToMany(() => Team, (team) => team.divisionName)
    teams: Team[];
}
