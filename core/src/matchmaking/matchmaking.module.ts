import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { GuidModule, EventsModule } from '@sprocketbot/lib';
import { ScrimCrudService } from './scrim-crud/scrim-crud.service';
import { ScrimService } from './scrim/scrim.service';
import { TimeoutService } from './timeout/timeout.service';
import { QueueModule } from './queue/queue.module';

@Module({
    imports: [DbModule, QueueModule, GuidModule, EventsModule],
    providers: [
        ScrimCrudService,
        ScrimService,
        TimeoutService,
    ],
    exports: [ScrimService, QueueModule],
})
export class MatchmakingModule { }