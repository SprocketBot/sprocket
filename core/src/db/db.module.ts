import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormBootstrapService } from './typeorm-bootstrap/typeorm-bootstrap.service';
import { SprocketConfigService } from '@sprocketbot/lib';
import { GameModeEntity } from './game_mode/game_mode.entity';
import { FranchiseEntity } from './franchise/franchise.entity';
import { GameEntity } from './game/game.entity';
import { FixtureEntity, MatchEntity, ScrimEntity } from './match/match.entity';
import { PlayerEntity } from './player/player.entity';
import { PlayerStatEntity } from './player_stat/player_stat.entity';
import { RoundEntity } from './round/round.entity';
import { ScheduleGroupEntity } from './schedule_group/schedule_group.entity';
import { ScheduleGroupTypeEntity } from './schedule_group_type/schedule_group_type.entity';
import { SkillGroupEntity } from './skill_group/skill_group.entity';
import { TeamEntity } from './team/team.entity';
import { UserEntity } from './user/user.entity';
import { FranchiseRepository } from './franchise/franchise.repository';
import { GameRepository } from './game/game.repository';
import { GameModeRepository } from './game_mode/game_mode.repository';
import {
  FixtureRepository,
  MatchRepository,
  ScrimRepository,
} from './match/match.repository';
import { PlayerRepository } from './player/player.repository';
import { PlayerStatRepository } from './player_stat/player_stat.repository';
import { RoundRepository } from './round/round.repository';
import { ScheduleGroupRepository } from './schedule_group/schedule_group.repository';
import { ScheduleGroupTypeRepository } from './schedule_group_type/schedule_group_type.repository';
import { SkillGroupRepository } from './skill_group/skill_group.repository';
import { TeamRepository } from './team/team.repository';
import { UserRepository } from './user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [SprocketConfigService],
      useClass: TypeormBootstrapService,
    }),
    TypeOrmModule.forFeature([
      FranchiseEntity,
      GameEntity,
      GameModeEntity,
      MatchEntity,
      ScrimEntity,
      FixtureEntity,
      PlayerEntity,
      PlayerStatEntity,
      RoundEntity,
      ScheduleGroupEntity,
      ScheduleGroupTypeEntity,
      SkillGroupEntity,
      TeamEntity,
      UserEntity,
    ]),
  ],
  providers: [
    FranchiseRepository,
    GameRepository,
    GameModeRepository,
    MatchRepository,
    ScrimRepository,
    FixtureRepository,
    PlayerRepository,
    PlayerStatRepository,
    RoundRepository,
    ScheduleGroupRepository,
    ScheduleGroupTypeRepository,
    SkillGroupRepository,
    TeamRepository,
    UserRepository,
  ],
  exports: [FranchiseRepository],
})
export class DbModule {}

// Add user.repository.ts to providers list
// Add player.repository.ts to providers list
// Add skill_group.repository.ts to providers list
// Add fixture.repository.ts to providers list
// Add schedule_group.repository.ts to providers list
// Add schedule_group_type.repository.ts to providers list
// Add match.repository.ts to providers list
// Add game.repository.ts to providers list
// Add game_mode.repository.ts to providers list
// Add player_stat.repository.ts to providers list
// Add team_stat.repository.ts to providers list
// Add round.repository.ts to providers list
// Add team.repository.ts to providers list
// Add franchise.repository.ts to providers list
