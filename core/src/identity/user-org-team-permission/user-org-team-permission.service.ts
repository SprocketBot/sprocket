import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";

import {UserOrgTeamPermission} from "$db/identity/user_org_team_permission/user_org_team_permission.model";
import {MLE_OrganizationTeam} from "../../database/mledb";

@Injectable()
export class UserOrgTeamPermissionService {
    constructor(
    @InjectRepository(UserOrgTeamPermission)
    private readonly repo: Repository<UserOrgTeamPermission>,
    ) {}

    async listOrgTeamsForUser(userId: number): Promise<MLE_OrganizationTeam[]> {
        const rows = await this.repo.find({where: {userId} });
        return [...new Set(rows.map(r => r.orgTeam))];
    }

    async replaceAllForUser(userId: number, orgTeams: MLE_OrganizationTeam[]): Promise<void> {
        const unique = [...new Set(orgTeams)];
        await this.repo.manager.transaction(async em => {
            await em.delete(UserOrgTeamPermission, {userId});
            if (unique.length === 0) return;
            await em.insert(
                UserOrgTeamPermission,
                unique.map(orgTeam => ({userId, orgTeam})),
            );
        });
    }

    async addForUser(userId: number, orgTeam: MLE_OrganizationTeam): Promise<void> {
        await this.repo.upsert({userId, orgTeam}, {conflictPaths: ["userId", "orgTeam"]});
    }

    async removeForUser(userId: number, orgTeam: MLE_OrganizationTeam): Promise<void> {
        await this.repo.delete({userId, orgTeam});
    }

    async removeAllForUsers(userIds: number[]): Promise<void> {
        if (userIds.length === 0) return;
        await this.repo.delete({userId: In(userIds)});
    }
}
