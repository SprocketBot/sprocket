import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  FixtureEntity,
  GameModeEntity,
  MatchEntity,
  PlayerEntity,
  ScrimEntity,
  UserAuthAccountEntity,
} from '../../db/internal';
import { StorageModule } from '../../storage/storage.module';
import { RocketLeagueSubmissionValidationService } from './rocket-league-submission-validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MatchEntity,
      FixtureEntity,
      ScrimEntity,
      GameModeEntity,
      UserAuthAccountEntity,
      PlayerEntity,
    ]),
    StorageModule,
  ],
  providers: [RocketLeagueSubmissionValidationService],
  exports: [RocketLeagueSubmissionValidationService],
})
export class RocketLeagueModule {}
