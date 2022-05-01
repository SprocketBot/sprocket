import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {EligibilityData} from "./EligibilityData";
import {Player} from "./Player";
import {Series} from "./Series";

@Index("scrim_pkey", ["id"], {unique: true})
@Entity("scrim", {schema: "public"})
export class Scrim {
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

    @Column("text", {name: "mode"})
    mode: string;

    @Column("text", {name: "type"})
    type: string;

    @Column("integer", {name: "base_scrim_points"})
    baseScrimPoints: number;

    @OneToMany(() => EligibilityData, (eligibilityData) => eligibilityData.scrim)
    eligibilityData: EligibilityData[];

    @ManyToOne(() => Player, (player) => player.scrims, {onUpdate: "CASCADE"})
    @JoinColumn([{name: "author_id", referencedColumnName: "id"}])
    author: Player;

    @ManyToOne(() => Player, (player) => player.scrims2, {onUpdate: "CASCADE"})
    @JoinColumn([{name: "host_id", referencedColumnName: "id"}])
    host: Player;

    @OneToOne(() => Series, (series) => series.scrim)
    series: Series;
}
