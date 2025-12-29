import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrimQueueEntity } from '../../db/scrim_queue/scrim_queue.entity';
import { ScrimTimeoutEntity } from '../../db/scrim_timeout/scrim_timeout.entity';
import { PlayerEntity } from '../../db/player/player.entity';
import { GameEntity } from '../../db/game/game.entity';
import { ScrimEntity } from '../../db/scrim/scrim.entity';
import { GameModeEntity } from '../../db/game_mode/game_mode.entity';
import { SkillGroupEntity } from '../../db/skill_group/skill_group.entity';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import { QueueService } from './queue.service';
import { QueueWorker } from './queue.worker';
import { EventsModule, GuidModule } from '@sprocketbot/lib';
import { ObservabilityModule } from '@sprocketbot/lib';
import { DbModule } from '../../db/db.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ScrimQueueEntity,
            ScrimTimeoutEntity,
            PlayerEntity,
            GameEntity,
            ScrimEntity,
            GameModeEntity,
            SkillGroupEntity,
        ]),
        DbModule,
        EventsModule,
        ObservabilityModule,
        GuidModule,
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