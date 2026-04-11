import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
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
import { ncpTeamRoleUsageCsvRowSchema } from './ncp-team-role-usage.csv-parse';
import {
  NcpRoleUsageBulkResult,
  NcpRoleUsageBulkSuccess,
  NcpTeamRoleInput,
  schemaToInput,
} from './ncp-team-role-usage.types';

@Resolver()
export class MledbNcpTeamRoleUsageResolver {
  constructor(private readonly ncpTeamRoleUsageService: MledbNcpTeamRoleUsageService) {}

  private readonly logger = new Logger(MledbNcpTeamRoleUsageResolver.name);

  @Mutation(() => Int, {
    description:
      'Input team role usage (MLEDB admin or LO). Always writes mledb.team_role_usage ' +
      '(three identical rows per slot for legacy accounting). Best-effort sprocket.roster_role_usage ' +
      '(one row per resolved slot); Sprocket write issues are logged and do not fail the mutation. ' +
      'League abbreviations FL/AL/CL/ML/PL map to MLE leagues; slot letters A–H map to PLAYERA–PLAYERH.',
  })
  @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
  async ncpTeamRoleUsage(
    @Args('row', { type: () => NcpTeamRoleInput }) row: NcpTeamRoleInput,
    @CurrentUser() user: UserPayload,
  ): Promise<number> {
    const actor = user?.username?.trim() || `userId:${user.userId}`;
    return this.ncpTeamRoleUsageService.importRow(row, actor);
  }

  @Mutation(() => NcpRoleUsageBulkResult, {
    description:
      'Bulk input of team role usage (MLEDB admin or LO). Writes mledb.team_role_usage; ' +
      'Sprocket roster_role_usage is best-effort per row (see ncpTeamRoleUsage).',
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
  ): Promise<typeof NcpRoleUsageBulkResult> {
    try {
      this.logger.debug('Starting bulk NCP role usage import.');
      const csv = await this.readUploadToString(file);

      const actor = user?.username?.trim() || `userId:${user.userId}`;
      const records = parseAndValidateCsv(csv, ncpTeamRoleUsageCsvRowSchema);
      for (const error of records.errors) {
        this.logger.error(
          `Error in CSV: Row ${error.row}, Field: ${error.field || 'N/A'}, Value: ${
            error.value || 'N/A'
          }, Message: ${error.message}`,
        );
      }
      let sumRecords = 0;
      for (const record of records.data) {
        try {
          const row = schemaToInput(record);
          sumRecords += await this.ncpTeamRoleUsageService.importRow(row, actor);
        } catch (error) {
          this.logger.error(`Error inputting NCP for series ${record.matchId}.`, error);
        }
      }

      const success = new NcpRoleUsageBulkSuccess();
      success.insertedMledbRowCount = sumRecords;
      return success;
    } catch (error) {
      this.logger.error(`Error in bulk NCP role usage: ${error}`);
      return new OperationError(
        error instanceof Error ? error.message : 'Failed to process bulk NCP role usage',
        500,
      );
    }
  }

  /** Resolves graphql-upload payloads: `Promise<FileUpload>`, bare `FileUpload`, or `{ promise }` wrapper. */
  private async readUploadToString(
    file: Promise<FileUpload> | FileUpload,
  ): Promise<string> {
    const resolved = await Promise.resolve(file);
    const asFile = resolved as FileUpload & { promise?: Promise<FileUpload> };
    const upload: FileUpload | undefined =
      typeof asFile.createReadStream === 'function'
        ? asFile
        : asFile.promise
          ? await asFile.promise
          : undefined;
    if (!upload || typeof upload.createReadStream !== 'function') {
      throw new BadRequestException(
        'Invalid file upload: missing createReadStream (check multipart map variable names)',
      );
    }
    return readToString(upload.createReadStream());
  }
}
