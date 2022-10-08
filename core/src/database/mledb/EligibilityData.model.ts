import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Player} from "./Player.model";
import {MLE_Scrim} from "./Scrim.model";

@Index("eligibility_data_pkey", ["id"], {unique: true})
@Index("eligibility_data_player_id_scrim_id", ["playerId", "scrimId"], {
    unique: true,
})
@Entity("eligibility_data", {schema: "mledb"})
export class MLE_EligibilityData {
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

    @Column("integer", {name: "player_id"})
    playerId: number;

    @Column("integer", {name: "scrim_id"})
    scrimId: number;

    @Column("integer", {name: "scrim_points"})
    scrimPoints: number;

    @ManyToOne(() => MLE_Player, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "player_id", referencedColumnName: "id"}])
    player: MLE_Player;

    @ManyToOne(() => MLE_Scrim, scrim => scrim.eligibilityData, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "scrim_id", referencedColumnName: "id"}])
    scrim: MLE_Scrim;
}
