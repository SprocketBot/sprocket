import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventQueue, EventStatus, EventTarget, EventType } from '../db/events/event_queue.entity';

@Injectable()
export class EventQueueService {
    private readonly logger = new Logger(EventQueueService.name);

    constructor(
        @InjectRepository(EventQueue)
        private readonly eventQueueRepository: Repository<EventQueue>,
    ) { }

    async publish(topic: EventTarget, type: EventType, payload: any): Promise<EventQueue> {
        this.logger.log(`Publishing event ${type} to ${topic}`);

        const event = this.eventQueueRepository.create({
            targetService: topic,
            eventType: type,
            payload: payload,
            status: EventStatus.PENDING,
        });

        return this.eventQueueRepository.save(event);
    }
}