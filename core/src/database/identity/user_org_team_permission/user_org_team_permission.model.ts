import {
    Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from "typeorm";

import {MLE_OrganizationTeam} from "../../mledb/enums/OrganizationTeam.enum";
import {User} from "../user/user.model";

@Entity({schema: "sprocket"})
@Unique(["userId", "orgTeam"])
@Index("user_org_team_permission_user_id_idx", ["userId"])
export class UserOrgTeamPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({name: "userId", type: "integer"})
    userId: number;

    @ManyToOne(() => User, {onDelete: "CASCADE"})
    @JoinColumn({name: "userId"})
    user: User;

    @Column({name: "orgTeam", type: "smallint"})
    orgTeam: MLE_OrganizationTeam;
}
