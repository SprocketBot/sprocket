import {forwardRef, Inject, Injectable, Logger} from "@nestjs/common";

import type {MLE_OrganizationTeam} from "../../database/mledb";
import {MledbPlayerService} from "../../mledb/mledb-player/mledb-player.service";
import {UserOrgTeamPermissionService} from "./user-org-team-permission.service";

/**
 * Runtime org-team permissions for JWT and guards.
 *
 * **Source of truth:** `sprocket.user_org_team_permission` (see {@link UserOrgTeamPermissionService}).
 *
 * **Temporary dual-read:** When `ORG_TEAM_PERMISSION_DUAL_READ=true`, always loads legacy
 * `mledb.player_to_org` as well, compares the two sets, and logs on mismatch. Effective permissions
 * are the union of Sprocket and MLEDB during the migration window so partially backfilled users do
 * not lose legacy access. Remove the env var and this branch once migration is validated.
 */
@Injectable()
export class OrgTeamPermissionResolutionService {
    private readonly logger = new Logger(OrgTeamPermissionResolutionService.name);

    constructor(
        private readonly userOrgTeamPermissionService: UserOrgTeamPermissionService,
        @Inject(forwardRef(() => MledbPlayerService))
        private readonly mledbPlayerService: MledbPlayerService,
    ) {}

    private orgTeamSetsEqual(a: MLE_OrganizationTeam[], b: MLE_OrganizationTeam[]): boolean {
        if (a.length !== b.length) return false;
        const sb = new Set(b);
        return a.every(x => sb.has(x));
    }

    private formatOrgTeamSet(teams: MLE_OrganizationTeam[]): string {
        return [...new Set(teams)].sort((x, y) => x - y).join(",");
    }

    private combineOrgTeams(...teamSets: MLE_OrganizationTeam[][]): MLE_OrganizationTeam[] {
        return [...new Set(teamSets.flat())];
    }

    async resolveOrgTeamsForUser(userId: number): Promise<MLE_OrganizationTeam[]> {
        const fromSprocket = await this.userOrgTeamPermissionService.listOrgTeamsForUser(userId);
        const dualRead = process.env.ORG_TEAM_PERMISSION_DUAL_READ === "true";

        let fromMledb: MLE_OrganizationTeam[] = [];
        if (dualRead) {
            try {
                const player = await this.mledbPlayerService.getMlePlayerBySprocketUser(userId);
                const legacy = await this.mledbPlayerService.getPlayerOrgs(player);
                fromMledb = [...new Set(legacy.map(row => row.orgTeam))];
            } catch (err) {
                this.logger.verbose(
                    `Dual-read MLEDB load failed for userId=${userId}: ${(err as Error).message}`,
                );
            }
        }

        if (dualRead && (fromSprocket.length > 0 || fromMledb.length > 0)) {
            if (!this.orgTeamSetsEqual(fromSprocket, fromMledb)) {
                const detail
                    = `userId=${userId} sprocket=[${this.formatOrgTeamSet(fromSprocket)}] mledb=[${this.formatOrgTeamSet(fromMledb)}]`;
                if (fromSprocket.length > 0 && fromMledb.length > 0) {
                    this.logger.warn(`Org-team dual-read mismatch (both non-empty): ${detail}`);
                } else if (fromSprocket.length === 0 && fromMledb.length > 0) {
                    this.logger.verbose(
                        `Org-team dual-read: no Sprocket rows, MLEDB has org teams (expected until backfill): ${detail}`,
                    );
                } else {
                    this.logger.warn(`Org-team dual-read mismatch (Sprocket non-empty, MLEDB empty): ${detail}`);
                }
            }
        }

        if (dualRead) {
            return this.combineOrgTeams(fromSprocket, fromMledb);
        }
        return fromSprocket;
    }
}
