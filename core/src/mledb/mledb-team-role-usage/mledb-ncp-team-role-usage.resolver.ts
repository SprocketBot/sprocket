import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';
import { buffer as streamToBuffer } from 'stream/consumers';
import { parseAndValidateCsv } from '../../util/csv-parse';
import type { FileUpload } from 'graphql-upload';

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
    @CurrentUser() user: UserPayload,
    @Args('file', { type: () => GraphQLUpload }) file: Promise<FileUpload>,
  ): Promise<number> {
    this.logger.debug('Starting bulk NCP role usage import.');
    const csv = await this.readGqlUploadToUtf8(file);

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
    return sumRecords;
  }

  /**
   * Same pattern as `parseReplays` / `changePlayerSkillGroupBulk`: use `.then` on the upload
   * promise, resolve graphql-upload’s `{ promise }` wrapper when needed, read bytes via
   * `stream/consumers` (avoids a manual `new Promise` stream shim).
   */
  private async readGqlUploadToUtf8(file: Promise<FileUpload> | FileUpload): Promise<string> {
    const buf = await Promise.resolve(file).then(async f => {
      const upload = await this.resolveGraphqlFileUpload(f);
      return streamToBuffer(upload.createReadStream());
    });
    return buf.toString('utf8');
  }

  private async resolveGraphqlFileUpload(f: unknown): Promise<FileUpload> {
    if (f != null && typeof (f as FileUpload).createReadStream === 'function') {
      return f as FileUpload;
    }
    const wrapped = f as { promise?: Promise<FileUpload> };
    if (wrapped?.promise) {
      return wrapped.promise;
    }
    throw new BadRequestException(
      'Invalid file upload: missing createReadStream (check multipart map variable names)',
    );
  }
}
