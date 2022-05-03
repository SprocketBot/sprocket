import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn,} from "typeorm";
import {MLE_EligibilityData} from "./EligibilityData.model";
import {MLE_Player} from "./Player.model";
import {MLE_Series} from "./Series.model";

@Index("scrim_pkey", ["id"], {unique: true})
@Entity("scrim", {schema: "mledb"})
export class MLE_Scrim {
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

    @OneToMany(() => MLE_EligibilityData, (eligibilityData) => eligibilityData.scrim)
    eligibilityData: MLE_EligibilityData[];

    @ManyToOne(() => MLE_Player, {onUpdate: "CASCADE"})
    @JoinColumn([{name: "author_id", referencedColumnName: "id"}])
    author: MLE_Player;

    @ManyToOne(() => MLE_Player, {onUpdate: "CASCADE"})
    @JoinColumn([{name: "host_id", referencedColumnName: "id"}])
    host: MLE_Player;

    @OneToOne(() => MLE_Series, (series) => series.scrim)
    series: MLE_Series;
}
