import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
    MatchSubmissionEntity,
    MatchEntity,
    ReplaySubmissionItemEntity,
    ReplaySubmissionRejectionEntity,
    ReplaySubmissionRatifierEntity,
    ScrimEntity,
    UserEntity,
} from '../db/internal';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { EventQueueModule } from '../events/event-queue.module';
import { ReplaySubmissionService } from './replay-submission.service';
import { ReplaySubmissionProcessor } from './replay-submission.processor';
import { StorageModule } from '../storage/storage.module';
import { RocketLeagueModule } from './rocket-league/rocket-league.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MatchSubmissionEntity,
            MatchEntity,
            ReplaySubmissionItemEntity,
            ReplaySubmissionRejectionEntity,
            ReplaySubmissionRatifierEntity,
            ScrimEntity,
            UserEntity,
        ]),
        EventQueueModule,
        StorageModule,
        RocketLeagueModule,
    ],
    providers: [SubmissionsService, ReplaySubmissionService, ReplaySubmissionProcessor],
    controllers: [SubmissionsController],
    exports: [SubmissionsService, ReplaySubmissionService],
})
export class SubmissionsModule {}
