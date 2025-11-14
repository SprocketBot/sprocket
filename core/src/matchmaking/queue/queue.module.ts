import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrimQueueEntity } from '../../db/scrim_queue/scrim_queue.entity';
import { ScrimQueueRepository } from '../../db/scrim_queue/scrim_queue.repository';
import { ScrimTimeoutRepository } from '../../db/scrim_timeout/scrim_timeout.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameRepository } from '../../db/game/game.repository';
import { ScrimRepository } from '../../db/scrim/scrim.repository';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import { QueueService } from './queue.service';
import { QueueWorker } from './queue.worker';
import { EventsModule } from '@sprocketbot/lib';
import { ObservabilityModule } from '@sprocketbot/lib';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ScrimQueueEntity,
            ScrimQueueRepository,
            ScrimTimeoutRepository,
            PlayerRepository,
            GameRepository,
            ScrimRepository,
        ]),
        EventsModule,
        ObservabilityModule,
        ScheduleModule.forRoot(),
    ],
    providers: [
        QueueService,
        QueueWorker,
        ScrimCrudService,
    ],
    exports: [QueueService],
})
export class QueueModule { }