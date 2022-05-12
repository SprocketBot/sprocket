import {
    Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Player} from "./Player.model";

@Index("player_to_org_pkey", ["id"], {unique: true})
@Entity("player_to_org", {schema: "mledb"})
export class MLE_PlayerToOrg {
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

    @Column("integer", {name: "org_team"})
    orgTeam: number;

    @ManyToOne(() => MLE_Player, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "player_id", referencedColumnName: "id"} ])
    player: MLE_Player;
}
