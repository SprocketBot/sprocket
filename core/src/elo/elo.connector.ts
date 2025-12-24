import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventQueue, EventStatus, EventTarget, EventType } from '../db/internal';
import { EloService } from './elo.service';

@Injectable()
export class EloConnector {
    private readonly logger = new Logger(EloConnector.name);

    constructor(
        @InjectRepository(EventQueue)
        private readonly eventRepo: Repository<EventQueue>,
        private readonly eloService: EloService,
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async processEvents() {
        const events = await this.eventRepo.find({
            where: {
                targetService: EventTarget.ELO_SERVICE,
                status: EventStatus.PENDING,
                eventType: EventType.MATCH_RATIFIED,
            },
            take: 10,
        });

        if (events.length === 0) return;

        this.logger.log(`Found ${events.length} Elo events to process`);

        for (const event of events) {
            try {
                // Determine matchId from payload
                const matchId = event.payload.matchId;
                if (!matchId) {
                    throw new Error('Match ID missing in payload');
                }

                await this.eloService.processMatch(matchId);

                event.status = EventStatus.PROCESSED;
                event.processedAt = new Date();
                await this.eventRepo.save(event);
            } catch (e) {
                this.logger.error(`Error processing Elo event ${event.id}:`, e);
                event.status = EventStatus.FAILED;
                event.retryCount += 1;
                // Simple retry logic could be added here or in query
                await this.eventRepo.save(event);
            }
        }
    }
}
