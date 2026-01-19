import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EligibilityData } from './eligibility_data';
import { Invalidation } from './invalidation';
import { Match } from './match/match.model';
import { MatchParent } from './match_parent/match_parent.model';
import { PlayerStatLine } from './player_stat_line/player_stat_line.model';
import { Round } from './round/round.model';
import { ScrimMeta } from './saved_scrim/scrim.model';
import { ScheduleFixture } from './schedule_fixture/schedule_fixture.model';
import { ScheduleGroup } from './schedule_group/schedule_group.model';
import { ScheduleGroupType } from './schedule_group_type/schedule_group_type.model';
import { ScheduledEvent } from './scheduled_event/scheduled_event.model';
import { TeamStatLine } from './team_stat_line/team_stat_line.model';

export const schedulingEntities = [
  EligibilityData,
  Invalidation,
  MatchParent,
  Match,
  Round,
  PlayerStatLine,
  ScheduleFixture,
  ScheduleGroupType,
  ScheduleGroup,
  ScheduledEvent,
  ScrimMeta,
  TeamStatLine,
];

const ormModule = TypeOrmModule.forFeature(schedulingEntities);

@Module({
  imports: [ormModule],
  exports: [ormModule],
})
export class SchedulingModule {}
