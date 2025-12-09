import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventQueue } from '../db/events/event_queue.entity';
import { EventQueueService } from './event-queue.service';

@Module({
    imports: [TypeOrmModule.forFeature([EventQueue])],
    providers: [EventQueueService],
    exports: [EventQueueService],
})
export class EventQueueModule { }