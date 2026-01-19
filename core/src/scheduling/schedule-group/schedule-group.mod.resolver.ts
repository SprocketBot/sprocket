import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { readToString } from '@sprocketbot/common';
import { GraphQLError } from 'graphql';
import type { FileUpload } from 'graphql-upload';
import { GraphQLUpload } from 'graphql-upload';

import { ScheduleGroup } from '$db/scheduling/schedule_group/schedule_group.model';
import { ScheduleGroupType } from '$db/scheduling/schedule_group_type/schedule_group_type.model';

import { MLE_OrganizationTeam } from '../../database/mledb';
import { CurrentUser, UserPayload } from '../../identity';
import { GqlJwtGuard } from '../../identity/auth/gql-auth-guard';
import { MLEOrganizationTeamGuard } from '../../mledb/mledb-player/mle-organization-team.guard';
import { ScheduleGroupService } from './schedule-group.service';
import { ScheduleGroupTypeService } from './schedule-group-type.service';
import { RawFixtureSchema } from './schedule-groups.types';

@Resolver()
@UseGuards(GqlJwtGuard)
export class ScheduleGroupModResolver {
  constructor(
    private readonly scheduleGroupService: ScheduleGroupService,
    private readonly scheduleGroupTypeService: ScheduleGroupTypeService,
  ) {}

  @Query(() => [ScheduleGroupType])
  async getScheduleGroupTypes(@CurrentUser() user: UserPayload): Promise<ScheduleGroupType[]> {
    if (!user.currentOrganizationId) {
      throw new GraphQLError('You must select an organization');
    }
    return this.scheduleGroupTypeService.getScheduleGroupTypesForOrg(user.currentOrganizationId);
  }

  @Query(() => [ScheduleGroup])
  async getScheduleGroups(
    @CurrentUser() user: UserPayload,
    @Args('type') type: string,
    @Args('game', { nullable: true }) gameId?: number,
  ): Promise<ScheduleGroup[]> {
    if (!user.currentOrganizationId) {
      throw new GraphQLError('You must select an organization');
    }
    return this.scheduleGroupService.getScheduleGroups(user.currentOrganizationId, type, gameId);
  }

  @Mutation(() => [ScheduleGroup])
  @UseGuards(
    MLEOrganizationTeamGuard([
      MLE_OrganizationTeam.MLEDB_ADMIN,
      MLE_OrganizationTeam.LEAGUE_OPERATIONS,
    ]),
  )
  async createSeason(
    @Args('season_number') num: number,
    @Args('input_file', { type: () => GraphQLUpload }) file: Promise<FileUpload>,
  ): Promise<ScheduleGroup[]> {
    // This method takes in a season number and a csv file of pre-specified
    // format (see the schedule group service for details), which contains
    // all of the Schedule Fixtures the new season should contain, as well
    // as which skill groups participate in which fixtures. The service then
    // generates the appropriate matches, match parents, schedule fixtures,
    // and schedule groups. Returns a list of schedule groups which contains
    // the newly created season, as well as its constituent SGs.

    const csv = await file.then(async _f => readToString(_f.createReadStream()));

    const splits = csv.split(/(?:\r)?\n/g);
    const results = splits.map(e => e.trim().split(','));
    const parsed = RawFixtureSchema.parse(results);
    const sgs = await this.scheduleGroupService.createSeasonSchedule(num, parsed);

    return sgs;
  }
}
