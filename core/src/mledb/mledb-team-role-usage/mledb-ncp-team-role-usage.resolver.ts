import {BadRequestException, UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Resolver} from "@nestjs/graphql";
import {readToString} from "@sprocketbot/common";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {MLE_OrganizationTeam} from "../../database/mledb";
import {CurrentUser} from "../../identity/auth/current-user.decorator";
import type {UserPayload} from "../../identity/auth/oauth";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../mledb-player/mle-organization-team.guard";

import {parseNcpTeamRoleUsageCsv} from "./ncp-team-role-usage-csv";
import {MledbNcpTeamRoleUsageService} from "./mledb-ncp-team-role-usage.service";
import {NcpTeamRoleUsageRowInput} from "./ncp-team-role-usage.types";

const MLEDB_NCP_TEAM_ROLE_USAGE_GUARDS = [
    GqlJwtGuard,
    MLEOrganizationTeamGuard([
        MLE_OrganizationTeam.MLEDB_ADMIN,
        MLE_OrganizationTeam.LEAGUE_OPERATIONS,
    ]),
] as const;

@Resolver()
export class MledbNcpTeamRoleUsageResolver {
    constructor(private readonly ncpTeamRoleUsageService: MledbNcpTeamRoleUsageService) {}

    @Mutation(() => Int, {
        description:
      "Bulk import NCP-style team role usage (MLEDB admin / league operations). Writes mledb.team_role_usage "
      + "(three identical rows per slot for legacy accounting) and sprocket.roster_role_usage "
      + "(one row per slot when franchise, team, roster role, and roster slot resolve). "
      + "League abbreviations FL/AL/CL/ML/PL map to MLE leagues; slot letters A–H map to PLAYERA–PLAYERH.",
    })
    @UseGuards(...MLEDB_NCP_TEAM_ROLE_USAGE_GUARDS)
    async importMledbNcpTeamRoleUsage(
    @Args("rows", {type: () => [NcpTeamRoleUsageRowInput]}) rows: NcpTeamRoleUsageRowInput[],
        @CurrentUser() user: UserPayload,
    ): Promise<number> {
        const actor = user?.username?.trim() || `userId:${user.userId}`;
        return this.ncpTeamRoleUsageService.importRows(rows, actor);
    }

    @Mutation(() => Int, {
        description:
      "Same as importMledbNcpTeamRoleUsage but accepts one CSV file. "
      + "Expected columns: Series ID, Team, League, Mode, then slot letters across Slots used and following columns "
      + "(matches the standard NCP sheet export). All valid rows are imported in a single transaction.",
    })
    @UseGuards(...MLEDB_NCP_TEAM_ROLE_USAGE_GUARDS)
    async importMledbNcpTeamRoleUsageBulk(
    @Args("file", {type: () => GraphQLUpload}) file: Promise<FileUpload>,
        @CurrentUser() user: UserPayload,
    ): Promise<number> {
        const csv = await readToString((await file).createReadStream());
        const parsed = parseNcpTeamRoleUsageCsv(csv);
        if (parsed.errors.length > 0) {
            const sample = parsed.errors
                .slice(0, 15)
                .map(e => `row ${e.row}: ${e.message}`)
                .join("; ");
            throw new BadRequestException(
                `CSV validation failed (${parsed.errors.length} issue(s)). ${sample}${
                    parsed.errors.length > 15 ? " …" : ""
                }`,
            );
        }
        if (parsed.data.length === 0) {
            throw new BadRequestException("CSV contains no data rows");
        }
        const actor = user?.username?.trim() || `userId:${user.userId}`;
        return this.ncpTeamRoleUsageService.importRows(
            parsed.data as NcpTeamRoleUsageRowInput[],
            actor,
        );
    }
}
