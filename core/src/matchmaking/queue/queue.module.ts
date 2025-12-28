import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrimQueueEntity } from '../../db/scrim_queue/scrim_queue.entity';
import { ScrimQueueRepository } from '../../db/scrim_queue/scrim_queue.repository';
import { ScrimTimeoutRepository } from '../../db/scrim_timeout/scrim_timeout.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameRepository } from '../../db/game/game.repository';
import { ScrimRepository } from '../../db/scrim/scrim.repository';
import { GameModeRepository } from '../../db/game_mode/game_mode.repository';
import { SkillGroupRepository } from '../../db/skill_group/skill_group.repository';
import { GameModeEntity } from '../../db/game_mode/game_mode.entity';
import { SkillGroupEntity } from '../../db/skill_group/skill_group.entity';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import { QueueService } from './queue.service';
import { QueueWorker } from './queue.worker';
import { EventsModule, GuidModule } from '@sprocketbot/lib';
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
            GameModeRepository,
            SkillGroupRepository,
            GameModeEntity,
            SkillGroupEntity,
        ]),
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