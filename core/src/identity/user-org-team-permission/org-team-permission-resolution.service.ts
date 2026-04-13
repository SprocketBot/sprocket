import {forwardRef, Inject, Injectable, Logger} from "@nestjs/common";

import type {MLE_OrganizationTeam} from "../../database/mledb";
import {MledbPlayerService} from "../../mledb/mledb-player/mledb-player.service";
import {UserOrgTeamPermissionService} from "./user-org-team-permission.service";

/**
 * Runtime org-team permissions for JWT and guards.
 *
 * **Source of truth:** `sprocket.user_org_team_permission` (see {@link UserOrgTeamPermissionService}).
 *
 * **Temporary compatibility:** When `ORG_TEAM_PERMISSION_DUAL_READ=true`, if a user has no Sprocket
 * rows, org teams are derived from legacy `mledb.player_to_org` via {@link MledbPlayerService}.
 * Remove that env var and delete the fallback branch once all users are migrated off MLEDB.
 */
@Injectable()
export class OrgTeamPermissionResolutionService {
    private readonly logger = new Logger(OrgTeamPermissionResolutionService.name);

    constructor(
        private readonly userOrgTeamPermissionService: UserOrgTeamPermissionService,
    @Inject(forwardRef(() => MledbPlayerService))
    private readonly mledbPlayerService: MledbPlayerService,
    ) {}

    async resolveOrgTeamsForUser(userId: number): Promise<MLE_OrganizationTeam[]> {
        const fromSprocket = await this.userOrgTeamPermissionService.listOrgTeamsForUser(userId);
        if (fromSprocket.length > 0) {
            return fromSprocket;
        }

        if (process.env.ORG_TEAM_PERMISSION_DUAL_READ !== "true") {
            return [];
        }

        try {
            const player = await this.mledbPlayerService.getMlePlayerBySprocketUser(userId);
            const legacy = await this.mledbPlayerService.getPlayerOrgs(player);
            return [...new Set(legacy.map(row => row.orgTeam))];
        } catch (err) {
            this.logger.verbose(
                `Dual-read org-team fallback skipped for user ${userId}: ${(err as Error).message}`,
            );
            return [];
        }
    }
}
