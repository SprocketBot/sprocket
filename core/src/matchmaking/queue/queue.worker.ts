import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from './queue.service';
import { ObservabilityService } from '@sprocketbot/lib';

@Injectable()
export class QueueWorker {
    private readonly logger = new Logger(QueueWorker.name);

    constructor(
        private readonly queueService: QueueService,
        private readonly observabilityService: ObservabilityService,
    ) { }

    /**
     * Process matchmaking every 30 seconds
     */
    @Cron(CronExpression.EVERY_30_SECONDS)
    async processMatchmaking() {
        const startTime = Date.now();
        this.logger.log('Starting matchmaking processing');

        try {
            const results = await this.queueService.processMatchmaking();

            if (results.length > 0) {
                this.logger.log(`Matchmaking completed: ${results.length} matches created`);

                // Record metrics
                this.observabilityService.incrementCounter('queue.worker.matchmaking.created', results.length);
            } else {
                this.logger.log('No matches found during matchmaking processing');
            }

            // Record processing duration
            this.observabilityService.recordHistogram('queue.worker.matchmaking.duration', Date.now() - startTime);

        } catch (error) {
            this.logger.error('Error during matchmaking processing', error);
            this.observabilityService.incrementCounter('queue.worker.matchmaking.error', 1);
        }
    }

    /**
     * Clean up expired queue entries every 5 minutes
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async cleanupExpiredQueues() {
        const startTime = Date.now();
        this.logger.log('Starting queue cleanup');

        try {
            const cleanedCount = await this.queueService.cleanupExpiredQueues();

            if (cleanedCount > 0) {
                this.logger.log(`Queue cleanup completed: ${cleanedCount} expired entries removed`);
            } else {
                this.logger.log('No expired queue entries found');
            }

            // Record processing duration
            this.observabilityService.recordHistogram('queue.worker.cleanup.duration', Date.now() - startTime);

        } catch (error) {
            this.logger.error('Error during queue cleanup', error);
            this.observabilityService.incrementCounter('queue.worker.cleanup.error', 1);
        }
    }

    /**
     * Record queue metrics every minute
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async recordQueueMetrics() {
        try {
            const stats = await this.queueService.getQueueStats();

            // Record queue size metrics using histogram as gauge alternative
            this.observabilityService.recordHistogram('queue.worker.size.total', stats.totalQueued);
            this.observabilityService.recordHistogram('queue.worker.wait_time.avg', stats.averageWaitTime);

            // Record per-game metrics
            for (const gameStat of stats.gameStats) {
                this.observabilityService.recordHistogram('queue.worker.size.by_game', gameStat.queuedCount);
            }

            this.logger.debug(`Queue metrics recorded: ${stats.totalQueued} total queued, ${stats.averageWaitTime}ms avg wait time`);

        } catch (error) {
            this.logger.error('Error recording queue metrics', error);
        }
    }
}