import {
    Column, Entity, Index, JoinColumn, ManyToOne, OneToOne,
} from "typeorm";

import {MLE_Division} from "./Division.model";
import {MLE_Player} from "./Player.model";
import {MLE_TeamBranding} from "./TeamBranding.model";

@Index("team_branding_id_unique", ["brandingId"], {unique: true})
@Index(
    "team_doubles_assistant_general_manager_id_unique",
    ["doublesAssistantGeneralManagerId"],
    {unique: true},
)
@Index("team_franchise_manager_id_unique", ["franchiseManagerId"], {
    unique: true,
})
@Index("team_general_manager_id_unique", ["generalManagerId"], {unique: true})
@Index("team_pkey", ["name"], {unique: true})
@Index("team_pr_support_id_unique", ["prSupportId"], {unique: true})
@Index(
    "team_standard_assistant_general_manager_id_unique",
    ["standardAssistantGeneralManagerId"],
    {unique: true},
)
@Entity("team")
export class MLE_Team {
    @Column("character varying", {
        primary: true, name: "name", length: 255,
    })
    name: string;

    @Column("character varying", {name: "created_by", length: 255})
    createdBy: string;

    @Column("timestamp without time zone", {name: "created_at"})
    createdAt: Date;

    @Column("character varying", {name: "updated_by", length: 255})
    updatedBy: string;

    @Column("timestamp without time zone", {name: "updated_at"})
    updatedAt: Date;

    @Column("integer", {
        name: "franchise_manager_id",
        nullable: true,
        unique: true,
    })
    franchiseManagerId: number | null;

    @Column("integer", {
        name: "general_manager_id",
        nullable: true,
        unique: true,
    })
    generalManagerId: number | null;

    @Column("integer", {
        name: "doubles_assistant_general_manager_id",
        nullable: true,
        unique: true,
    })
    doublesAssistantGeneralManagerId: number | null;

    @Column("integer", {
        name: "standard_assistant_general_manager_id",
        nullable: true,
        unique: true,
    })
    standardAssistantGeneralManagerId: number | null;

    @Column("integer", {
        name: "pr_support_id", nullable: true, unique: true,
    })
    prSupportId: number | null;

    @Column("character varying", {name: "callsign", length: 255})
    callsign: string;

    @Column("integer", {
        name: "branding_id", nullable: true, unique: true,
    })
    brandingId: number | null;

    @OneToOne(() => MLE_TeamBranding, teamBranding => teamBranding.team, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "branding_id", referencedColumnName: "id"} ])
    branding: MLE_TeamBranding;

    @ManyToOne(() => MLE_Division, division => division.teams, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "division_name", referencedColumnName: "name"} ])
    divisionName: MLE_Division;

    @OneToOne(() => MLE_Player, player => player.teamName, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([
        {
            name: "doubles_assistant_general_manager_id",
            referencedColumnName: "id",
        },
    ])
    doublesAssistantGeneralManager: MLE_Player;

    @OneToOne(() => MLE_Player, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "franchise_manager_id", referencedColumnName: "id"} ])
    franchiseManager: MLE_Player;

    @OneToOne(() => MLE_Player, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "general_manager_id", referencedColumnName: "id"} ])
    generalManager: MLE_Player;

    @OneToOne(() => MLE_Player, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "pr_support_id", referencedColumnName: "id"} ])
    prSupport: MLE_Player;

    @OneToOne(() => MLE_Player, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {
        name: "standard_assistant_general_manager_id",
        referencedColumnName: "id",
    } ])
    standardAssistantGeneralManager: MLE_Player;
}
