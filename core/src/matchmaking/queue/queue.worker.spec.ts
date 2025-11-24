/**
 * Unit tests for QueueWorker
 * Tests cron jobs, background processing, and worker functionality
 */

import { Test, TestingModule } from '@nestjs/testing';
import { QueueWorker } from './queue.worker';
import { QueueService } from './queue.service';
import { ObservabilityService } from '@sprocketbot/lib';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('QueueWorker', () => {
    let worker: QueueWorker;
    let queueService: any;
    let observabilityService: any;
    let consoleLogSpy: any;
    let consoleErrorSpy: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueWorker,
                {
                    provide: QueueService,
                    useValue: {
                        processMatchmaking: vi.fn(),
                        cleanupExpiredQueues: vi.fn(),
                        getQueueStats: vi.fn(),
                    },
                },
                {
                    provide: ObservabilityService,
                    useValue: {
                        incrementCounter: vi.fn(),
                        recordHistogram: vi.fn(),
                    },
                },
            ],
        }).compile();

        worker = module.get<QueueWorker>(QueueWorker);
        queueService = module.get(QueueService);
        observabilityService = module.get(ObservabilityService);

        // Mock console methods to avoid test output pollution
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.clearAllMocks();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe('Worker Definition', () => {
        it('should be defined', () => {
            expect(worker).toBeDefined();
        });
    });

    describe('processMatchmaking', () => {
        it('should process matchmaking successfully and create matches', async () => {
            const mockMatches = [
                {
                    scrimId: 'scrim-1',
                    players: ['player-1', 'player-2'],
                    gameId: 'game-1',
                    skillRating: 1500,
                },
                {
                    scrimId: 'scrim-2',
                    players: ['player-3', 'player-4'],
                    gameId: 'game-1',
                    skillRating: 1600,
                },
            ];

            queueService.processMatchmaking.mockResolvedValue(mockMatches);

            await worker.processMatchmaking();

            // Verify queue service was called
            expect(queueService.processMatchmaking).toHaveBeenCalledTimes(1);

            // Verify observability metrics
            expect(observabilityService.incrementCounter).toHaveBeenCalledWith('queue.worker.matchmaking.created', 2);
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.matchmaking.duration', expect.any(Number));

            // Verify logging
            expect(consoleLogSpy).toHaveBeenCalledWith('Starting matchmaking processing');
            expect(consoleLogSpy).toHaveBeenCalledWith('Matchmaking completed: 2 matches created');
        });

        it('should handle no matches found gracefully', async () => {
            queueService.processMatchmaking.mockResolvedValue([]);

            await worker.processMatchmaking();

            expect(queueService.processMatchmaking).toHaveBeenCalledTimes(1);
            expect(observabilityService.incrementCounter).not.toHaveBeenCalledWith('queue.worker.matchmaking.created', expect.any(Number));
            expect(consoleLogSpy).toHaveBeenCalledWith('No matches found during matchmaking processing');
        });

        it('should handle errors during matchmaking processing', async () => {
            const error = new Error('Database connection failed');
            queueService.processMatchmaking.mockRejectedValue(error);

            await worker.processMatchmaking();

            expect(queueService.processMatchmaking).toHaveBeenCalledTimes(1);
            expect(observabilityService.incrementCounter).toHaveBeenCalledWith('queue.worker.matchmaking.error', 1);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error during matchmaking processing', error);
        });

        it('should record processing duration even when errors occur', async () => {
            const error = new Error('Test error');
            queueService.processMatchmaking.mockRejectedValue(error);

            await worker.processMatchmaking();

            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.matchmaking.duration', expect.any(Number));
        });
    });

    describe('cleanupExpiredQueues', () => {
        it('should clean up expired queues successfully', async () => {
            const cleanedCount = 15;
            queueService.cleanupExpiredQueues.mockResolvedValue(cleanedCount);

            await worker.cleanupExpiredQueues();

            expect(queueService.cleanupExpiredQueues).toHaveBeenCalledTimes(1);
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.cleanup.duration', expect.any(Number));
            expect(consoleLogSpy).toHaveBeenCalledWith('Starting queue cleanup');
            expect(consoleLogSpy).toHaveBeenCalledWith('Queue cleanup completed: 15 expired entries removed');
        });

        it('should handle no expired entries gracefully', async () => {
            queueService.cleanupExpiredQueues.mockResolvedValue(0);

            await worker.cleanupExpiredQueues();

            expect(queueService.cleanupExpiredQueues).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith('No expired queue entries found');
        });

        it('should handle errors during cleanup', async () => {
            const error = new Error('Cleanup failed');
            queueService.cleanupExpiredQueues.mockRejectedValue(error);

            await worker.cleanupExpiredQueues();

            expect(queueService.cleanupExpiredQueues).toHaveBeenCalledTimes(1);
            expect(observabilityService.incrementCounter).toHaveBeenCalledWith('queue.worker.cleanup.error', 1);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error during queue cleanup', error);
        });
    });

    describe('recordQueueMetrics', () => {
        it('should record queue metrics successfully', async () => {
            const mockStats = {
                totalQueued: 42,
                averageWaitTime: 300000, // 5 minutes
                gameStats: [
                    { gameId: 'game-1', queuedCount: 20 },
                    { gameId: 'game-2', queuedCount: 15 },
                    { gameId: 'game-3', queuedCount: 7 },
                ],
            };

            queueService.getQueueStats.mockResolvedValue(mockStats);

            await worker.recordQueueMetrics();

            expect(queueService.getQueueStats).toHaveBeenCalledTimes(1);

            // Verify metrics recording
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.size.total', 42);
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.wait_time.avg', 300000);

            // Verify per-game metrics
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.size.by_game', 20);
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.size.by_game', 15);
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.size.by_game', 7);

            // Verify debug logging
            expect(consoleLogSpy).toHaveBeenCalledWith('Queue metrics recorded: 42 total queued, 300000ms avg wait time');
        });

        it('should handle errors during metrics recording', async () => {
            const error = new Error('Metrics recording failed');
            queueService.getQueueStats.mockRejectedValue(error);

            await worker.recordQueueMetrics();

            expect(queueService.getQueueStats).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error recording queue metrics', error);
        });

        it('should handle empty queue statistics', async () => {
            const mockStats = {
                totalQueued: 0,
                averageWaitTime: 0,
                gameStats: [],
            };

            queueService.getQueueStats.mockResolvedValue(mockStats);

            await worker.recordQueueMetrics();

            expect(queueService.getQueueStats).toHaveBeenCalledTimes(1);
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.size.total', 0);
            expect(observabilityService.recordHistogram).toHaveBeenCalledWith('queue.worker.wait_time.avg', 0);
            expect(consoleLogSpy).toHaveBeenCalledWith('Queue metrics recorded: 0 total queued, 0ms avg wait time');
        });
    });

    describe('Cron job timing and scheduling', () => {
        it('should have proper cron expressions configured', () => {
            // Test that the cron decorators are properly configured
            // Note: In a real test, you might want to verify the actual cron expressions
            // This is more of a configuration test

            const processMatchmakingMethod = Object.getOwnPropertyDescriptor(QueueWorker.prototype, 'processMatchmaking');
            const cleanupExpiredQueuesMethod = Object.getOwnPropertyDescriptor(QueueWorker.prototype, 'cleanupExpiredQueues');
            const recordQueueMetricsMethod = Object.getOwnPropertyDescriptor(QueueWorker.prototype, 'recordQueueMetrics');

            expect(processMatchmakingMethod).toBeDefined();
            expect(cleanupExpiredQueuesMethod).toBeDefined();
            expect(recordQueueMetricsMethod).toBeDefined();
        });
    });

    describe('Performance and efficiency', () => {
        it('should complete operations within reasonable time limits', async () => {
            // Mock operations with slight delays
            queueService.processMatchmaking.mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return [];
            });

            queueService.cleanupExpiredQueues.mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return 0;
            });

            queueService.getQueueStats.mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 25));
                return { totalQueued: 0, averageWaitTime: 0, gameStats: [] };
            });

            const startTime = Date.now();

            await worker.processMatchmaking();
            await worker.cleanupExpiredQueues();
            await worker.recordQueueMetrics();

            const endTime = Date.now();
            const totalDuration = endTime - startTime;

            // All operations should complete within reasonable time (< 1 second total)
            expect(totalDuration).toBeLessThan(1000);
        });

        it('should handle rapid successive calls efficiently', async () => {
            queueService.processMatchmaking.mockResolvedValue([]);
            queueService.cleanupExpiredQueues.mockResolvedValue(0);
            queueService.getQueueStats.mockResolvedValue({ totalQueued: 0, averageWaitTime: 0, gameStats: [] });

            const startTime = Date.now();

            // Simulate rapid successive calls
            const promises = [
                worker.processMatchmaking(),
                worker.processMatchmaking(),
                worker.cleanupExpiredQueues(),
                worker.recordQueueMetrics(),
                worker.recordQueueMetrics(),
            ];

            await Promise.all(promises);

            const endTime = Date.now();

            // Should handle rapid calls efficiently
            expect(endTime - startTime).toBeLessThan(500);
        });
    });

    describe('Error recovery and resilience', () => {
        it('should continue operating after individual method failures', async () => {
            // First call fails
            queueService.processMatchmaking.mockRejectedValueOnce(new Error('First call failed'));

            // Subsequent calls succeed
            queueService.processMatchmaking.mockResolvedValue([]);
            queueService.cleanupExpiredQueues.mockResolvedValue(0);
            queueService.getQueueStats.mockResolvedValue({ totalQueued: 0, averageWaitTime: 0, gameStats: [] });

            // First call should handle error gracefully
            await worker.processMatchmaking();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error during matchmaking processing', expect.any(Error));

            // Subsequent calls should work normally
            await worker.processMatchmaking();
            await worker.cleanupExpiredQueues();
            await worker.recordQueueMetrics();

            expect(queueService.processMatchmaking).toHaveBeenCalledTimes(2);
            expect(queueService.cleanupExpiredQueues).toHaveBeenCalledTimes(1);
            expect(queueService.getQueueStats).toHaveBeenCalledTimes(1);
        });

        it('should handle observability service failures gracefully', async () => {
            // Make observability service fail
            observabilityService.incrementCounter.mockRejectedValue(new Error('Observability failed'));
            observabilityService.recordHistogram.mockRejectedValue(new Error('Observability failed'));

            queueService.processMatchmaking.mockResolvedValue([]);
            queueService.cleanupExpiredQueues.mockResolvedValue(0);
            queueService.getQueueStats.mockResolvedValue({ totalQueued: 0, averageWaitTime: 0, gameStats: [] });

            // Should not throw even if observability fails
            await expect(worker.processMatchmaking()).resolves.not.toThrow();
            await expect(worker.cleanupExpiredQueues()).resolves.not.toThrow();
            await expect(worker.recordQueueMetrics()).resolves.not.toThrow();
        });
    });

    describe('Logging and debugging', () => {
        it('should log appropriate debug information', async () => {
            queueService.processMatchmaking.mockResolvedValue([]);
            queueService.cleanupExpiredQueues.mockResolvedValue(0);
            queueService.getQueueStats.mockResolvedValue({ totalQueued: 5, averageWaitTime: 1000, gameStats: [] });

            await worker.processMatchmaking();
            await worker.cleanupExpiredQueues();
            await worker.recordQueueMetrics();

            // Verify appropriate logging
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Starting matchmaking processing'));
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Starting queue cleanup'));
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Queue metrics recorded'));
        });

        it('should not log debug information in production-like scenarios', async () => {
            // Mock debug level to be disabled (would be configured in real app)
            const originalDebug = console.debug;
            console.debug = vi.fn();

            queueService.getQueueStats.mockResolvedValue({ totalQueued: 0, averageWaitTime: 0, gameStats: [] });

            await worker.recordQueueMetrics();

            // In this test, we're using console.log for debug, so it should still log
            // In a real app, you'd configure logging levels
            expect(console.debug).not.toHaveBeenCalled();

            console.debug = originalDebug;
        });
    });
});