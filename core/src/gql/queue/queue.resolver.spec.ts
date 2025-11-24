import { Test, TestingModule } from '@nestjs/testing';
import { QueueResolver } from './queue.resolver';
import { ScrimService } from '../../matchmaking/scrim/scrim.service';
import { QueueService } from '../../matchmaking/queue/queue.service';
import { CurrentUser } from '../../auth/current-user/current-user.decorator';
import { UserObject } from '../user/user.object';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('QueueResolver', () => {
    let resolver: QueueResolver;
    let scrimService: any;
    let queueService: any;

    const mockUser: UserObject = {
        id: 'user-123',
        username: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        active: true,
        players: [],
        accounts: [],
        allowedActions: [],
        createdAt: new Date(),
        updateAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueResolver,
                {
                    provide: ScrimService,
                    useValue: {
                        joinQueue: vi.fn(),
                        leaveQueue: vi.fn(),
                        getQueueStatus: vi.fn(),
                        getQueuePosition: vi.fn(),
                        processMatchmaking: vi.fn(),
                    },
                },
                {
                    provide: QueueService,
                    useValue: {
                        getQueueStats: vi.fn(),
                        processMatchmaking: vi.fn(),
                    },
                },
            ],
        }).compile();

        resolver = module.get<QueueResolver>(QueueResolver);
        scrimService = module.get<ScrimService>(ScrimService);
        queueService = module.get<QueueService>(QueueService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Service Definition', () => {
        it('should be defined', () => {
            expect(resolver).toBeDefined();
        });
    });

    describe('joinQueue', () => {
        const joinQueueInput = {
            gameId: 'game-123',
            skillRating: 1500,
        };

        it('should successfully join queue and return true', async () => {
            scrimService.joinQueue.mockResolvedValue({ id: 'queue-entry-123' });

            const result = await resolver.joinQueue(mockUser, joinQueueInput.gameId, joinQueueInput.skillRating);

            expect(result).toBe(true);
            expect(scrimService.joinQueue).toHaveBeenCalledWith(
                mockUser.id,
                joinQueueInput.gameId,
                joinQueueInput.skillRating
            );
        });

        it('should handle join queue errors and throw GraphQL error', async () => {
            const errorMessage = 'Player is already in queue';
            scrimService.joinQueue.mockRejectedValue(new Error(errorMessage));

            await expect(
                resolver.joinQueue(mockUser, joinQueueInput.gameId, joinQueueInput.skillRating)
            ).rejects.toThrow(`Failed to join queue: ${errorMessage}`);
        });

        it('should handle RPC exceptions and transform to GraphQL error', async () => {
            const rpcError = new Error('Player is already in an active scrim');
            scrimService.joinQueue.mockRejectedValue(rpcError);

            await expect(
                resolver.joinQueue(mockUser, joinQueueInput.gameId, joinQueueInput.skillRating)
            ).rejects.toThrow(`Failed to join queue: ${rpcError.message}`);
        });

        it('should handle database connection errors', async () => {
            const dbError = new Error('Database connection failed');
            scrimService.joinQueue.mockRejectedValue(dbError);

            await expect(
                resolver.joinQueue(mockUser, joinQueueInput.gameId, joinQueueInput.skillRating)
            ).rejects.toThrow(`Failed to join queue: ${dbError.message}`);
        });

        it('should validate input parameters', async () => {
            // Test with invalid skill rating (negative)
            await expect(
                resolver.joinQueue(mockUser, joinQueueInput.gameId, -100)
            ).rejects.toThrow(/Failed to join queue:/);

            // Test with empty game ID
            await expect(
                resolver.joinQueue(mockUser, '', joinQueueInput.skillRating)
            ).rejects.toThrow(/Failed to join queue:/);
        });
    });

    describe('leaveQueue', () => {
        it('should successfully leave queue and return true', async () => {
            scrimService.leaveQueue.mockResolvedValue(true);

            const result = await resolver.leaveQueue(mockUser);

            expect(result).toBe(true);
            expect(scrimService.leaveQueue).toHaveBeenCalledWith(mockUser.id);
        });

        it('should handle leave queue errors and throw GraphQL error', async () => {
            const errorMessage = 'Player is not in queue';
            scrimService.leaveQueue.mockRejectedValue(new Error(errorMessage));

            await expect(resolver.leaveQueue(mockUser)).rejects.toThrow(
                `Failed to leave queue: ${errorMessage}`
            );
        });

        it('should handle case when player is not in queue', async () => {
            scrimService.leaveQueue.mockResolvedValue(false);

            const result = await resolver.leaveQueue(mockUser);

            expect(result).toBe(false);
        });

        it('should handle concurrent leave operations', async () => {
            scrimService.leaveQueue.mockResolvedValue(true);

            // Simulate concurrent leave requests
            const results = await Promise.all([
                resolver.leaveQueue(mockUser),
                resolver.leaveQueue(mockUser),
                resolver.leaveQueue(mockUser),
            ]);

            expect(results).toEqual([true, true, true]);
            expect(scrimService.leaveQueue).toHaveBeenCalledTimes(3);
        });
    });

    describe('getQueueStatus', () => {
        it('should return queue status when player is in queue', async () => {
            const mockQueueStatus = {
                player: { id: mockUser.id },
                game: { id: 'game-123' },
                skillRating: 1500,
                queuedAt: new Date('2023-01-01T12:00:00Z'),
            };
            const mockPosition = 3;

            scrimService.getQueueStatus.mockResolvedValue(mockQueueStatus);
            scrimService.getQueuePosition.mockResolvedValue(mockPosition);

            const result = await resolver.getQueueStatus(mockUser);

            expect(result).toEqual({
                playerId: mockUser.id,
                gameId: 'game-123',
                skillRating: 1500,
                queuedAt: mockQueueStatus.queuedAt,
                position: mockPosition,
            });
            expect(scrimService.getQueueStatus).toHaveBeenCalledWith(mockUser.id);
            expect(scrimService.getQueuePosition).toHaveBeenCalledWith(mockUser.id);
        });

        it('should return null when player is not in queue', async () => {
            scrimService.getQueueStatus.mockResolvedValue(null);

            const result = await resolver.getQueueStatus(mockUser);

            expect(result).toBeNull();
            expect(scrimService.getQueueStatus).toHaveBeenCalledWith(mockUser.id);
            expect(scrimService.getQueuePosition).not.toHaveBeenCalled();
        });

        it('should handle getQueueStatus errors and throw GraphQL error', async () => {
            const errorMessage = 'Database query failed';
            scrimService.getQueueStatus.mockRejectedValue(new Error(errorMessage));

            await expect(resolver.getQueueStatus(mockUser)).rejects.toThrow(
                `Failed to get queue status: ${errorMessage}`
            );
        });

        it('should handle getQueuePosition errors gracefully', async () => {
            const mockQueueStatus = {
                player: { id: mockUser.id },
                game: { id: 'game-123' },
                skillRating: 1500,
                queuedAt: new Date(),
            };

            scrimService.getQueueStatus.mockResolvedValue(mockQueueStatus);
            scrimService.getQueuePosition.mockRejectedValue(new Error('Position calculation failed'));

            await expect(resolver.getQueueStatus(mockUser)).rejects.toThrow(
                `Failed to get queue status: Position calculation failed`
            );
        });

        it('should handle complex queue status with multiple players', async () => {
            const mockQueueStatus = {
                player: { id: mockUser.id, name: 'Test Player' },
                game: { id: 'game-123', name: 'Test Game' },
                skillRating: 1750,
                queuedAt: new Date(),
            };
            const mockPosition = 1; // First in queue

            scrimService.getQueueStatus.mockResolvedValue(mockQueueStatus);
            scrimService.getQueuePosition.mockResolvedValue(mockPosition);

            const result = await resolver.getQueueStatus(mockUser);

            expect(result).toEqual({
                playerId: mockUser.id,
                gameId: 'game-123',
                skillRating: 1750,
                queuedAt: mockQueueStatus.queuedAt,
                position: 1,
            });
        });
    });

    describe('getQueueStats', () => {
        it('should return queue statistics without game filter', async () => {
            const mockStats = {
                totalQueued: 42,
                averageWaitTime: 300000, // 5 minutes in milliseconds
                gameStats: [
                    { gameId: 'game-123', queuedCount: 25 },
                    { gameId: 'game-456', queuedCount: 17 },
                ],
            };

            queueService.getQueueStats.mockResolvedValue(mockStats);

            const result = await resolver.getQueueStats();

            expect(result).toEqual({
                totalQueued: 42,
                averageWaitTime: 300000,
                gameStats: [
                    { gameId: 'game-123', queuedCount: 25 },
                    { gameId: 'game-456', queuedCount: 17 },
                ],
            });
            expect(queueService.getQueueStats).toHaveBeenCalledWith(undefined);
        });

        it('should return queue statistics with specific game filter', async () => {
            const gameId = 'game-123';
            const mockStats = {
                totalQueued: 25,
                averageWaitTime: 240000, // 4 minutes
                gameStats: [
                    { gameId: 'game-123', queuedCount: 25 },
                ],
            };

            queueService.getQueueStats.mockResolvedValue(mockStats);

            const result = await resolver.getQueueStats(gameId);

            expect(result).toEqual({
                totalQueued: 25,
                averageWaitTime: 240000,
                gameStats: [
                    { gameId: 'game-123', queuedCount: 25 },
                ],
            });
            expect(queueService.getQueueStats).toHaveBeenCalledWith(gameId);
        });

        it('should handle empty queue statistics', async () => {
            const mockStats = {
                totalQueued: 0,
                averageWaitTime: 0,
                gameStats: [],
            };

            queueService.getQueueStats.mockResolvedValue(mockStats);

            const result = await resolver.getQueueStats();

            expect(result).toEqual({
                totalQueued: 0,
                averageWaitTime: 0,
                gameStats: [],
            });
        });

        it('should handle getQueueStats errors and throw GraphQL error', async () => {
            const errorMessage = 'Statistics calculation failed';
            queueService.getQueueStats.mockRejectedValue(new Error(errorMessage));

            await expect(resolver.getQueueStats()).rejects.toThrow(
                `Failed to get queue stats: ${errorMessage}`
            );
        });

        it('should handle large queue statistics', async () => {
            const largeGameStats = Array.from({ length: 100 }, (_, i) => ({
                gameId: `game-${i}`,
                queuedCount: Math.floor(Math.random() * 50) + 1,
            }));

            const mockStats = {
                totalQueued: 2500,
                averageWaitTime: 600000, // 10 minutes
                gameStats: largeGameStats,
            };

            queueService.getQueueStats.mockResolvedValue(mockStats);

            const result = await resolver.getQueueStats();

            expect(result.totalQueued).toBe(2500);
            expect(result.gameStats).toHaveLength(100);
            expect(result.averageWaitTime).toBe(600000);
        });
    });

    describe('processMatchmaking', () => {
        it('should successfully process matchmaking and return results', async () => {
            const mockResults = [
                {
                    scrimId: 'scrim-123',
                    players: ['player-1', 'player-2'],
                    gameId: 'game-123',
                    skillRating: 1525,
                },
                {
                    scrimId: 'scrim-456',
                    players: ['player-3', 'player-4'],
                    gameId: 'game-456',
                    skillRating: 1750,
                },
            ];

            queueService.processMatchmaking.mockResolvedValue(mockResults);

            const result = await resolver.processMatchmaking();

            expect(result).toEqual([
                {
                    scrimId: 'scrim-123',
                    playerIds: ['player-1', 'player-2'],
                    gameId: 'game-123',
                    skillRating: 1525,
                },
                {
                    scrimId: 'scrim-456',
                    playerIds: ['player-3', 'player-4'],
                    gameId: 'game-456',
                    skillRating: 1750,
                },
            ]);
            expect(queueService.processMatchmaking).toHaveBeenCalled();
        });

        it('should handle empty matchmaking results', async () => {
            queueService.processMatchmaking.mockResolvedValue([]);

            const result = await resolver.processMatchmaking();

            expect(result).toEqual([]);
        });

        it('should handle processMatchmaking errors and throw GraphQL error', async () => {
            const errorMessage = 'Matchmaking algorithm failed';
            queueService.processMatchmaking.mockRejectedValue(new Error(errorMessage));

            await expect(resolver.processMatchmaking()).rejects.toThrow(
                `Failed to process matchmaking: ${errorMessage}`
            );
        });

        it('should handle complex matchmaking scenarios', async () => {
            const complexResults = Array.from({ length: 10 }, (_, i) => ({
                scrimId: `scrim-${i}`,
                players: [`player-${i * 2}`, `player-${i * 2 + 1}`],
                gameId: `game-${i % 3}`,
                skillRating: 1500 + (i * 50),
            }));

            queueService.processMatchmaking.mockResolvedValue(complexResults);

            const result = await resolver.processMatchmaking();

            expect(result).toHaveLength(10);
            result.forEach((match, index) => {
                expect(match.scrimId).toBe(`scrim-${index}`);
                expect(match.playerIds).toHaveLength(2);
                expect(match.skillRating).toBe(1500 + (index * 50));
            });
        });
    });

    describe('GraphQL Context and Authentication', () => {
        it('should handle missing user context', async () => {
            const nullUser = null;

            await expect(
                resolver.joinQueue(nullUser, 'game-123', 1500)
            ).rejects.toThrow(/Failed to join queue:/);
        });

        it('should handle undefined user context', async () => {
            const undefinedUser = undefined;

            await expect(
                resolver.joinQueue(undefinedUser, 'game-123', 1500)
            ).rejects.toThrow(/Failed to join queue:/);
        });

        it('should validate user object structure', async () => {
            const invalidUser = { id: null, username: 'test' } as UserObject;

            await expect(
                resolver.joinQueue(invalidUser, 'game-123', 1500)
            ).rejects.toThrow(/Failed to join queue:/);
        });

        it('should handle authentication guard context', async () => {
            // Test that the resolver methods are properly decorated with @UseGuards
            const joinQueueMetadata = Reflect.getMetadata('__guards__', QueueResolver.prototype.joinQueue);
            const leaveQueueMetadata = Reflect.getMetadata('__guards__', QueueResolver.prototype.leaveQueue);
            const getQueueStatusMetadata = Reflect.getMetadata('__guards__', QueueResolver.prototype.getQueueStatus);
            const processMatchmakingMetadata = Reflect.getMetadata('__guards__', QueueResolver.prototype.processMatchmaking);

            // These should have guards applied
            expect(joinQueueMetadata).toBeDefined();
            expect(leaveQueueMetadata).toBeDefined();
            expect(getQueueStatusMetadata).toBeDefined();
            expect(processMatchmakingMetadata).toBeDefined();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle null responses from services', async () => {
            scrimService.getQueueStatus.mockResolvedValue(null);

            const result = await resolver.getQueueStatus(mockUser);

            expect(result).toBeNull();
        });

        it('should handle undefined responses from services', async () => {
            scrimService.getQueueStatus.mockResolvedValue(undefined);

            const result = await resolver.getQueueStatus(mockUser);

            expect(result).toBeNull();
        });

        it('should handle service methods returning unexpected data types', async () => {
            scrimService.joinQueue.mockResolvedValue('unexpected-string');

            const result = await resolver.joinQueue(mockUser, 'game-123', 1500);

            expect(result).toBe(true);
        });

        it('should handle very large skill ratings', async () => {
            const largeSkillRating = 999999;
            scrimService.joinQueue.mockResolvedValue({ id: 'queue-entry-123' });

            const result = await resolver.joinQueue(mockUser, 'game-123', largeSkillRating);

            expect(result).toBe(true);
            expect(scrimService.joinQueue).toHaveBeenCalledWith(mockUser.id, 'game-123', largeSkillRating);
        });

        it('should handle zero skill rating', async () => {
            scrimService.joinQueue.mockResolvedValue({ id: 'queue-entry-123' });

            const result = await resolver.joinQueue(mockUser, 'game-123', 0);

            expect(result).toBe(true);
            expect(scrimService.joinQueue).toHaveBeenCalledWith(mockUser.id, 'game-123', 0);
        });

        it('should handle special characters in game IDs', async () => {
            const specialGameId = 'game-123!@#$%^&*()';
            scrimService.joinQueue.mockResolvedValue({ id: 'queue-entry-123' });

            const result = await resolver.joinQueue(mockUser, specialGameId, 1500);

            expect(result).toBe(true);
            expect(scrimService.joinQueue).toHaveBeenCalledWith(mockUser.id, specialGameId, 1500);
        });
    });

    describe('Performance and Concurrent Operations', () => {
        it('should handle multiple concurrent queue operations', async () => {
            scrimService.joinQueue.mockResolvedValue({ id: 'queue-entry-123' });

            const operations = Array.from({ length: 10 }, (_, i) =>
                resolver.joinQueue(mockUser, `game-${i}`, 1500 + i)
            );

            const results = await Promise.all(operations);

            expect(results).toHaveLength(10);
            results.forEach((result, index) => {
                expect(result).toBe(true);
            });
        });

        it('should handle rapid successive queue operations', async () => {
            scrimService.joinQueue.mockResolvedValue({ id: 'queue-entry-123' });
            scrimService.leaveQueue.mockResolvedValue(true);

            // Join queue
            const joinResult = await resolver.joinQueue(mockUser, 'game-123', 1500);
            expect(joinResult).toBe(true);

            // Leave queue
            const leaveResult = await resolver.leaveQueue(mockUser);
            expect(leaveResult).toBe(true);

            // Join again
            const joinAgainResult = await resolver.joinQueue(mockUser, 'game-123', 1500);
            expect(joinAgainResult).toBe(true);
        });

        it('should handle timeout scenarios', async () => {
            // Simulate a timeout by making the service call take a long time
            scrimService.getQueueStatus.mockImplementation(() =>
                new Promise((resolve) => setTimeout(() => resolve(null), 100))
            );

            const result = await resolver.getQueueStatus(mockUser);

            expect(result).toBeNull();
        });
    });

    describe('Type Safety and Schema Compliance', () => {
        it('should return correct GraphQL types for joinQueue', async () => {
            scrimService.joinQueue.mockResolvedValue({ id: 'queue-entry-123' });

            const result = await resolver.joinQueue(mockUser, 'game-123', 1500);

            expect(typeof result).toBe('boolean');
            expect(result).toBe(true);
        });

        it('should return correct GraphQL types for leaveQueue', async () => {
            scrimService.leaveQueue.mockResolvedValue(true);

            const result = await resolver.leaveQueue(mockUser);

            expect(typeof result).toBe('boolean');
            expect(result).toBe(true);
        });

        it('should return correct GraphQL types for getQueueStatus', async () => {
            const mockQueueStatus = {
                player: { id: mockUser.id },
                game: { id: 'game-123' },
                skillRating: 1500,
                queuedAt: new Date(),
            };
            scrimService.getQueueStatus.mockResolvedValue(mockQueueStatus);
            scrimService.getQueuePosition.mockResolvedValue(1);

            const result = await resolver.getQueueStatus(mockUser);

            expect(result).toHaveProperty('playerId');
            expect(result).toHaveProperty('gameId');
            expect(result).toHaveProperty('skillRating');
            expect(result).toHaveProperty('queuedAt');
            expect(result).toHaveProperty('position');
            expect(typeof result.playerId).toBe('string');
            expect(typeof result.gameId).toBe('string');
            expect(typeof result.skillRating).toBe('number');
            expect(result.queuedAt).toBeInstanceOf(Date);
            expect(typeof result.position).toBe('number');
        });

        it('should return correct GraphQL types for getQueueStats', async () => {
            const mockStats = {
                totalQueued: 10,
                averageWaitTime: 300000,
                gameStats: [
                    { gameId: 'game-123', queuedCount: 5 },
                    { gameId: 'game-456', queuedCount: 5 },
                ],
            };

            queueService.getQueueStats.mockResolvedValue(mockStats);

            const result = await resolver.getQueueStats();

            expect(typeof result.totalQueued).toBe('number');
            expect(typeof result.averageWaitTime).toBe('number');
            expect(Array.isArray(result.gameStats)).toBe(true);
            result.gameStats.forEach(gameStat => {
                expect(typeof gameStat.gameId).toBe('string');
                expect(typeof gameStat.queuedCount).toBe('number');
            });
        });

        it('should return correct GraphQL types for processMatchmaking', async () => {
            const mockResults = [
                {
                    scrimId: 'scrim-123',
                    players: ['player-1', 'player-2'],
                    gameId: 'game-123',
                    skillRating: 1525,
                },
            ];

            queueService.processMatchmaking.mockResolvedValue(mockResults);

            const result = await resolver.processMatchmaking();

            expect(Array.isArray(result)).toBe(true);
            result.forEach(match => {
                expect(typeof match.scrimId).toBe('string');
                expect(Array.isArray(match.playerIds)).toBe(true);
                expect(typeof match.gameId).toBe('string');
                expect(typeof match.skillRating).toBe('number');
            });
        });
    });
});