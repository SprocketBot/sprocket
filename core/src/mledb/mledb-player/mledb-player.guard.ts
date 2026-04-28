import type {CanActivate, ExecutionContext} from "@nestjs/common";
import {Injectable} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {MLE_OrganizationTeam} from "../../database/mledb";
import type {UserPayload} from "../../identity/auth";
import {OrgTeamPermissionResolutionService} from "../../identity/user-org-team-permission/org-team-permission-resolution.service";
import {MledbPlayerService} from "./mledb-player.service";

@Injectable()
export class FormerPlayerScrimGuard implements CanActivate {
    constructor(
        private readonly mledbPlayerService: MledbPlayerService,
        private readonly orgTeamPermissionResolution: OrgTeamPermissionResolutionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const payload = ctx.getContext().req.user as UserPayload;
        const orgTeams = await this.orgTeamPermissionResolution.resolveOrgTeamsForUser(payload.userId);
        if (
            orgTeams.some(t => t === MLE_OrganizationTeam.MLEDB_ADMIN
          || t === MLE_OrganizationTeam.LEAGUE_OPERATIONS)
        ) {
            return true;
        }

        const mlePlayer = await this.mledbPlayerService.getMlePlayerBySprocketUser(payload.userId);

        if (mlePlayer.teamName === "FP") throw new GraphQLError("User is a former player in MLE");

        return true;
    }
}
