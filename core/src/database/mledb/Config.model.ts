import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Index("config_pkey", ["id"], {unique: true})
@Index("config_key_unique", ["key"], {unique: true})
@Entity("config", {schema: "mledb"})
export class Config {
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

    @Column("character varying", {name: "key", unique: true, length: 255})
    key: string;

    @Column("character varying", {name: "value", length: 255})
    value: string;
}
