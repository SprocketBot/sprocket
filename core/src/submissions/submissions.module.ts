import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchSubmissionEntity } from '../db/internal';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { EventQueueModule } from '../events/event-queue.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([MatchSubmissionEntity]),
        EventQueueModule,
    ],
    providers: [SubmissionsService],
    controllers: [SubmissionsController],
    exports: [SubmissionsService],
})
export class SubmissionsModule { }