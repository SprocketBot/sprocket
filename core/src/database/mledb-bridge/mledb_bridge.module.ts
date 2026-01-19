import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DivisionToFranchiseGroup } from './division_to_franchise_group.model';
import { FixtureToFixture } from './fixture_to_fixture.model';
import { LeagueToSkillGroup } from './league_to_skill_group.model';
import { MatchToScheduleGroup } from './match_to_schedule_group.model';
import { PlayerToPlayer } from './player_to_player.model';
import { PlayerToUser } from './player_to_user.model';
import { SeasonToScheduleGroup } from './season_to_schedule_group.model';
import { SeriesToMatchParent } from './series_to_match_parent.model';
import { TeamToFranchise } from './team_to_franchise.model';

export const bridgeEntities = [
  DivisionToFranchiseGroup,
  FixtureToFixture,
  LeagueToSkillGroup,
  MatchToScheduleGroup,
  PlayerToPlayer,
  PlayerToUser,
  SeasonToScheduleGroup,
  SeriesToMatchParent,
  TeamToFranchise,
];

const ormModule = TypeOrmModule.forFeature(bridgeEntities);

@Module({
  imports: [ormModule],
  exports: [ormModule],
})
export class MledbBridgeModule {}
