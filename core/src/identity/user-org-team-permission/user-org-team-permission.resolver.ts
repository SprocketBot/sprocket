import {UseGuards} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, registerEnumType, Resolver,
} from "@nestjs/graphql";

import {MLE_OrganizationTeam} from "../../database/mledb";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {GqlJwtGuard} from "../auth/gql-auth-guard";
import {UserOrgTeamPermissionService} from "./user-org-team-permission.service";

registerEnumType(MLE_OrganizationTeam, {name: "MLE_OrganizationTeam"});

@Resolver()
export class UserOrgTeamPermissionResolver {
    constructor(private readonly permissionService: UserOrgTeamPermissionService) {}

    @Query(() => [MLE_OrganizationTeam])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async userOrgTeamPermissions(
    @Args("userId", {type: () => Int}) userId: number,
    ): Promise<MLE_OrganizationTeam[]> {
        return this.permissionService.listOrgTeamsForUser(userId);
    }

    @Mutation(() => [MLE_OrganizationTeam])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async setUserOrgTeamPermissions(
    @Args("userId", {type: () => Int}) userId: number,
    @Args("orgTeams", {type: () => [MLE_OrganizationTeam]}) orgTeams: MLE_OrganizationTeam[],
    ): Promise<MLE_OrganizationTeam[]> {
        await this.permissionService.replaceAllForUser(userId, orgTeams);
        return this.permissionService.listOrgTeamsForUser(userId);
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async addUserOrgTeamPermission(
    @Args("userId", {type: () => Int}) userId: number,
    @Args("orgTeam", {type: () => MLE_OrganizationTeam}) orgTeam: MLE_OrganizationTeam,
    ): Promise<boolean> {
        await this.permissionService.addForUser(userId, orgTeam);
        return true;
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async removeUserOrgTeamPermission(
    @Args("userId", {type: () => Int}) userId: number,
    @Args("orgTeam", {type: () => MLE_OrganizationTeam}) orgTeam: MLE_OrganizationTeam,
    ): Promise<boolean> {
        await this.permissionService.removeForUser(userId, orgTeam);
        return true;
    }
}
