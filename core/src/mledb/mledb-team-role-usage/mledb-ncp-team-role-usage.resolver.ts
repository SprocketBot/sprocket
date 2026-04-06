import {UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Resolver} from "@nestjs/graphql";

import {MLE_OrganizationTeam} from "../../database/mledb";
import {CurrentUser} from "../../identity/auth/current-user.decorator";
import type {UserPayload} from "../../identity/auth/oauth";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../mledb-player/mle-organization-team.guard";

import {MledbNcpTeamRoleUsageService} from "./mledb-ncp-team-role-usage.service";
import {NcpTeamRoleUsageRowInput} from "./ncp-team-role-usage.types";

@Resolver()
export class MledbNcpTeamRoleUsageResolver {
    constructor(private readonly ncpTeamRoleUsageService: MledbNcpTeamRoleUsageService) {}

    @Mutation(() => Int, {
        description:
      "Bulk import NCP-style team role usage into mledb.team_role_usage (MLEDB admin). "
      + "League abbreviations FL/AL/CL/ML/PL map to FOUNDATION/ACADEMY/CHAMPION/MASTER/PREMIER. "
      + "Slot letters A–H map to PLAYERA–PLAYERH. Each slot is stored as three identical rows.",
    })
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async importMledbNcpTeamRoleUsage(
    @Args("rows", {type: () => [NcpTeamRoleUsageRowInput]}) rows: NcpTeamRoleUsageRowInput[],
        @CurrentUser() user: UserPayload,
    ): Promise<number> {
        const actor = user?.username?.trim() || `userId:${user.userId}`;
        return this.ncpTeamRoleUsageService.importRows(rows, actor);
    }
}
