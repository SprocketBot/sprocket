import { Logger, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { parseAndValidateCsv } from '../../util/csv-parse';
import type { FileUpload } from 'graphql-upload';
import { readToString } from '@sprocketbot/common';

import { MLE_OrganizationTeam } from '../../database/mledb';
import { CurrentUser } from '../../identity/auth/current-user.decorator';
import type { UserPayload } from '../../identity/auth/oauth';
import { GqlJwtGuard } from '../../identity/auth/gql-auth-guard';
import { MLEOrganizationTeamGuard } from '../mledb-player/mle-organization-team.guard';
import { OperationError } from 'src/franchise/player/player.types';
import { MledbNcpTeamRoleUsageService } from './mledb-ncp-team-role-usage.service';
import {
  ncpTeamRoleUsageInput,
  ncpTeamRoleUsageInputSchema,
  NcpTeamRoleInput,
  NcpRoleUsageResult,
  schemaToInput,
} from './ncp-team-role-usage.types';

@Resolver()
export class MledbNcpTeamRoleUsageResolver {
  constructor(private readonly ncpTeamRoleUsageService: MledbNcpTeamRoleUsageService) {}

  private readonly logger = new Logger(MledbNcpTeamRoleUsageResolver.name);

  @Mutation(() => Int, {
    description:
      'Input team role usage (MLEDB admin or LO). Writes mledb.team_role_usage ' +
      '(three identical rows per slot for legacy accounting) and sprocket.roster_role_usage ' +
      '(one row per slot when franchise, team, roster role, and roster slot resolve). ' +
      'League abbreviations FL/AL/CL/ML/PL map to MLE leagues; slot letters A–H map to PLAYERA–PLAYERH.',
  })
  @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
  async ncpTeamRoleUsage(
    @Args('row', { type: () => NcpTeamRoleInput }) row: NcpTeamRoleInput,
    @CurrentUser() user: UserPayload,
  ): Promise<typeof NcpRoleUsageResult> {
    const actor = user?.username?.trim() || `userId:${user.userId}`;
    return this.ncpTeamRoleUsageService.importRow(row, actor);
  }

  @Mutation(() => Int, {
    description: 'Bulk input of team role usage (MLEDB admin or LO). Writes mledb.team_role_usage',
  })
  @UseGuards(
    GqlJwtGuard,
    MLEOrganizationTeamGuard([
      MLE_OrganizationTeam.MLEDB_ADMIN,
      MLE_OrganizationTeam.LEAGUE_OPERATIONS,
    ]),
  )
  async ncpTeamRoleUsageBulk(
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>,
    @CurrentUser() user: UserPayload,
  ): Promise<typeof NcpRoleUsageResult> {
    try {
      this.logger.debug('Starting bulk NCP role usage import.');
      const csv = await readToString((await file).createReadStream());

      this.logger.debug('Parsing and validating CSV files');
      this.logger.debug(`Parsing and validating a CSV file: ${csv.substring(0, 50)}...`);
      const records = parseAndValidateCsv(csv, ncpTeamRoleUsageInputSchema);
      this.logger.debug(`Processing ${records.data.length} records from CSV`);
      this.logger.debug(`Found ${records.errors.length} errors in CSV`);
      for (const error of records.errors) {
        this.logger.error(
          `Error in CSV: Row ${error.row}, Field: ${error.field || 'N/A'}, Value: ${
            error.value || 'N/A'
          }, Message: ${error.message}`,
        );
      }
      this.logger.debug(`Processing ${records.data.length} valid records from CSV`);
      for (const record of records.data) {
        try {
          const row = schemaToInput(record);
          await this.ncpTeamRoleUsage(row, user);
        } catch (error) {
          this.logger.error(`Error inputting NCP for series ${record.matchId}.`, error);
        }
      }

      return new OperationError('Bulk NCP role usage intake completed successfully', 200);
    } catch (error) {
      this.logger.error(`Error in bulk skill group change: ${error}`);
      return new OperationError(
        error instanceof Error ? error.message : 'Failed to process bulk skill group change',
        500,
      );
    }
  }
}
