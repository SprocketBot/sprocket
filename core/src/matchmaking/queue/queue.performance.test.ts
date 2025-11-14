/**
 * Performance and edge case tests for QueueService
 * Tests high concurrency, large datasets, timeout handling, and edge cases
 */

import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScrimQueueEntity, QueueStatus } from '../../db/scrim_queue/scrim_queue.entity';
import { ScrimQueueRepository } from '../../db/scrim_queue/scrim_queue.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameRepository } from '../../db/game/game.repository';
import { ScrimRepository } from '../../db/scrim/scrim.repository';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import { EventsService } from '@sprocketbot/lib';
import { GuidService } from '@sprocketbot/lib';
import { ObservabilityService } from '@sprocketbot/lib';
import { ScrimEntity, ScrimState } from '../../db/scrim/scrim.entity';
import { GameEntity } from '../../db/game/game.entity';
import { PlayerEntity } from '../../db/player/player.entity';
import { GameModeEntity } from '../../db/game_mode/game_mode.entity';
import { SkillGroupEntity } from '../../db/skill_group/skill_group.entity';
import { UserEntity } from '../../db/user/user.entity';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('QueueService Performance Tests', () => {
    let service: QueueService;
    let scrimQueueRepository: any;
    let playerRepository: any;
    let gameRepository: any;
    let scrimRepository: any;
    let scrimCrudService: any;
    let eventService: any;
    let guidService: any;
    let observabilityService: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueService,
                {
                    provide: getRepositoryToken(ScrimQueueEntity),
                    useValue: {
                        findOne: vi.fn(),
                        find: vi.fn(),
                        create: vi.fn(),
                        save: vi.fn(),
                        createQueryBuilder: vi.fn(),
                    },
                },
                {
                    provide: ScrimQueueRepository,
                    useValue: {
                        findOne: vi.fn(),
                        find: vi.fn(),
                        create: vi.fn(),
                        save: vi.fn(),
                        createQueryBuilder: vi.fn(),
                    },
                },
                {
                    provide: PlayerRepository,
                    useValue: {
                        findOne: vi.fn(),
                    },
                },
                {
                    provide: GameRepository,
                    useValue: {
                        findOne: vi.fn(),
                        find: vi.fn(),
                    },
                },
                {
                    provide: ScrimRepository,
                    useValue: {
                        findOne: vi.fn(),
                        createQueryBuilder: vi.fn(),
                    },
                },
                {
                    provide: ScrimCrudService,
                    useValue: {
                        createScrim: vi.fn(),
                        addUserToScrim: vi.fn(),
                    },
                },
                {
                    provide: EventsService,
                    useValue: {
                        publish: vi.fn(),
                    },
                },
                {
                    provide: GuidService,
                    useValue: {
                        getId: vi.fn().mockReturnValue('test-id'),
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

        service = module.get<QueueService>(QueueService);
        scrimQueueRepository = module.get(ScrimQueueRepository);
        playerRepository = module.get(PlayerRepository);
        gameRepository = module.get(GameRepository);
        scrimRepository = module.get(ScrimRepository);
        scrimCrudService = module.get(ScrimCrudService);
        eventService = module.get(EventsService);
        guidService = module.get(GuidService);
        observabilityService = module.get(ObservabilityService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('High concurrency queue operations', () => {
        it('should handle concurrent join operations efficiently', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const concurrentOperations = 100;

            // Mock no existing queue entries and no active scrims
            scrimQueueRepository.findOne.mockResolvedValue(null);
            scrimRepository.findOne.mockResolvedValue(null);

            // Mock successful saves
            const mockQueueEntry = {
                id: 'test-id',
                player: { id: 'player-id' },
                game: { id: 'game-123' },
                skillRating: 1500,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.create.mockReturnValue(mockQueueEntry as any);
            scrimQueueRepository.save.mockResolvedValue(mockQueueEntry as any);

            const startTime = Date.now();

            // Simulate concurrent join operations
            const joinPromises = Array(concurrentOperations).fill(null).map((_, index) =>
                service.joinQueue({
                    playerId: `player-${index}`,
                    gameId: game.id,
                    skillRating: 1500 + (index % 500),
                })
            );

            const results = await Promise.all(joinPromises);
            const endTime = Date.now();

            // All operations should succeed
            expect(results).toHaveLength(concurrentOperations);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.status).toBe(QueueStatus.QUEUED);
            });

            // Should complete within reasonable time (< 5 seconds for 100 operations)
            expect(endTime - startTime).toBeLessThan(5000);

            // Verify observability calls
            expect(observabilityService.incrementCounter).toHaveBeenCalledTimes(concurrentOperations);
        });

        it('should handle concurrent leave operations efficiently', async () => {
            const concurrentOperations = 50;

            // Mock existing queue entries
            scrimQueueRepository.findOne.mockImplementation((options: any) => {
                const playerId = options.where.player.id;
                return Promise.resolve({
                    id: `queue-${playerId}`,
                    player: { id: playerId },
                    status: QueueStatus.QUEUED,
                    game: { id: 'game-123' },
                });
            });
            scrimQueueRepository.save.mockResolvedValue({ status: QueueStatus.CANCELLED });

            const startTime = Date.now();

            // Simulate concurrent leave operations
            const leavePromises = Array(concurrentOperations).fill(null).map((_, index) =>
                service.leaveQueue({ playerId: `player-${index}` })
            );

            const results = await Promise.all(leavePromises);
            const endTime = Date.now();

            // All operations should succeed
            expect(results).toHaveLength(concurrentOperations);
            results.forEach(result => {
                expect(result).toBe(true);
            });

            // Should complete within reasonable time (< 3 seconds for 50 operations)
            expect(endTime - startTime).toBeLessThan(3000);
        });

        it('should handle mixed concurrent operations', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const operationCount = 30;

            // Mock alternating states for mixed operations
            let callCount = 0;
            scrimQueueRepository.findOne.mockImplementation((options: any) => {
                callCount++;
                if (options.where.player) {
                    // Check for existing queue entry
                    return Promise.resolve(callCount % 3 === 0 ? {
                        id: `queue-${options.where.player.id}`,
                        player: { id: options.where.player.id },
                        status: QueueStatus.QUEUED,
                        game: { id: 'game-123' },
                    } : null);
                }
                // Check for active scrim
                return Promise.resolve(null);
            });

            // Mock successful operations
            const mockQueueEntry = {
                id: 'test-id',
                player: { id: 'player-id' },
                game: { id: 'game-123' },
                skillRating: 1500,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.create.mockReturnValue(mockQueueEntry as any);
            scrimQueueRepository.save.mockResolvedValue(mockQueueEntry as any);

            const startTime = Date.now();

            // Simulate mixed operations
            const mixedPromises = Array(operationCount).fill(null).map((_, index) => {
                if (index % 3 === 0) {
                    return service.leaveQueue({ playerId: `player-${index}` });
                } else {
                    return service.joinQueue({
                        playerId: `player-${index}`,
                        gameId: game.id,
                        skillRating: 1500 + (index % 500),
                    });
                }
            });

            const results = await Promise.allSettled(mixedPromises);
            const endTime = Date.now();

            // Should complete within reasonable time
            expect(endTime - startTime).toBeLessThan(5000);

            // Verify results
            const successfulOperations = results.filter(r => r.status === 'fulfilled');
            expect(successfulOperations.length).toBeGreaterThan(0);
        });
    });

    describe('Large queue processing', () => {
        it('should handle matchmaking with large number of players efficiently', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const playerCount = 1000;

            // Mock game and player data
            gameRepository.find.mockResolvedValue([game] as any);
            gameRepository.findOne.mockResolvedValue(game as any);

            // Create mock players with varying skill ratings
            const mockPlayers = Array(playerCount).fill(null).map((_, index) => ({
                id: `queue-${index}`,
                player: { id: `player-${index}` },
                game: { id: game.id },
                skillRating: 1000 + (index * 2), // Skills from 1000 to 3000
                queuedAt: new Date(Date.now() - (playerCount - index) * 100), // Staggered queue times
                status: QueueStatus.QUEUED,
            }));

            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);

            // Mock player skill group
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);

            // Mock scrim creation
            const mockScrim = {
                id: 'scrim-123',
                players: [{ id: 'player-1' }, { id: 'player-2' }],
                game: { id: game.id },
                gameMode: { id: 'mode-1' },
                skillGroup: { id: 'skill-1' },
            };
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const startTime = Date.now();
            const matches = await service.processMatchmaking();
            const endTime = Date.now();

            // Should create matches
            expect(matches.length).toBeGreaterThan(0);

            // Should complete within reasonable time (< 10 seconds for 1000 players)
            expect(endTime - startTime).toBeLessThan(10000);

            // Verify match quality
            matches.forEach(match => {
                expect(match.players.length).toBeGreaterThanOrEqual(2);
                expect(match.skillRating).toBeGreaterThan(0);
            });
        });

        it('should handle queue statistics calculation for large datasets efficiently', async () => {
            const gameCount = 10;
            const playersPerGame = 100;
            const totalPlayers = gameCount * playersPerGame;

            // Create mock data for multiple games
            const mockEntries = [];
            for (let gameIndex = 0; gameIndex < gameCount; gameIndex++) {
                for (let playerIndex = 0; playerIndex < playersPerGame; playerIndex++) {
                    mockEntries.push({
                        id: `queue-${gameIndex}-${playerIndex}`,
                        game: { id: `game-${gameIndex}` },
                        queuedAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Random time within last hour
                        status: QueueStatus.QUEUED,
                    });
                }
            }

            scrimQueueRepository.find.mockResolvedValue(mockEntries as any);

            const startTime = Date.now();
            const stats = await service.getQueueStats();
            const endTime = Date.now();

            // Verify statistics
            expect(stats.totalQueued).toBe(totalPlayers);
            expect(stats.gameStats.length).toBe(gameCount);
            expect(stats.averageWaitTime).toBeGreaterThan(0);

            // Should complete quickly (< 1 second for 1000 entries)
            expect(endTime - startTime).toBeLessThan(1000);
        });

        it('should handle cleanup operations for large number of expired entries efficiently', async () => {
            const expiredCount = 500;
            const activeCount = 50;

            // Create mock expired entries
            const expiredEntries = Array(expiredCount).fill(null).map((_, index) => ({
                id: `expired-queue-${index}`,
                status: QueueStatus.QUEUED,
                queuedAt: new Date(Date.now() - 15 * 60 * 1000 - index * 1000), // 15+ minutes ago
            }));

            // Create mock active entries
            const activeEntries = Array(activeCount).fill(null).map((_, index) => ({
                id: `active-queue-${index}`,
                status: QueueStatus.QUEUED,
                queuedAt: new Date(Date.now() - index * 1000), // Recent
            }));

            scrimQueueRepository.find.mockResolvedValue([...expiredEntries, ...activeEntries] as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);

            const startTime = Date.now();
            const cleanedCount = await service.cleanupExpiredQueues();
            const endTime = Date.now();

            expect(cleanedCount).toBe(expiredCount);

            // Should complete within reasonable time (< 3 seconds for 500 entries)
            expect(endTime - startTime).toBeLessThan(3000);

            // Verify save was called for each expired entry
            expect(scrimQueueRepository.save).toHaveBeenCalledTimes(expiredCount);
        });
    });

    describe('Skill rating edge cases', () => {
        it('should handle players with extreme skill rating differences', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };

            // Create players with extreme skill differences
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: game.id },
                    skillRating: 0, // Minimum skill
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: game.id },
                    skillRating: 5000, // Maximum skill
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-3',
                    player: { id: 'player-3' },
                    game: { id: game.id },
                    skillRating: 2500, // Medium skill
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            gameRepository.find.mockResolvedValue([game] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(game as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);

            const mockScrim = {
                id: 'scrim-123',
                players: [{ id: 'player-1' }, { id: 'player-2' }],
                game: { id: game.id },
                gameMode: { id: 'mode-1' },
                skillGroup: { id: 'skill-1' },
            };
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const matches = await service.processMatchmaking();

            // Should still create matches despite extreme differences
            expect(matches.length).toBeGreaterThan(0);

            // Verify skill ranges in matches are reasonable
            matches.forEach(match => {
                expect(match.skillRating).toBeGreaterThanOrEqual(0);
                expect(match.skillRating).toBeLessThanOrEqual(5000);
            });
        });

        it('should handle players with negative skill ratings gracefully', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };

            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: game.id },
                    skillRating: -100, // Negative skill rating
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: game.id },
                    skillRating: -50, // Another negative skill rating
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            gameRepository.find.mockResolvedValue([game] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);

            const matches = await service.processMatchmaking();

            // Should handle negative skills gracefully
            expect(matches.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle players with identical skill ratings', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };

            const mockPlayers = Array(10).fill(null).map((_, index) => ({
                id: `queue-${index}`,
                player: { id: `player-${index}` },
                game: { id: game.id },
                skillRating: 1500, // All players have identical skill rating
                queuedAt: new Date(Date.now() - index * 1000), // Different queue times
                status: QueueStatus.QUEUED,
            }));

            gameRepository.find.mockResolvedValue([game] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(game as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);

            const mockScrim = {
                id: 'scrim-123',
                players: [{ id: 'player-1' }, { id: 'player-2' }],
                game: { id: game.id },
                gameMode: { id: 'mode-1' },
                skillGroup: { id: 'skill-1' },
            };
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const matches = await service.processMatchmaking();

            // Should create matches based on queue order when skills are identical
            expect(matches.length).toBeGreaterThan(0);
            matches.forEach(match => {
                expect(match.skillRating).toBe(1500); // All matches should have skill rating 1500
            });
        });
    });

    describe('Timeout handling', () => {
        it('should handle queue operations with simulated network delays', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };

            // Mock repository operations with delays
            scrimQueueRepository.findOne.mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
                return null;
            });
            scrimRepository.findOne.mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
                return null;
            });
            scrimQueueRepository.save.mockImplementation(async (entity: any) => {
                await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
                return entity;
            });

            const mockQueueEntry = {
                id: 'test-id',
                player: { id: 'player-id' },
                game: { id: 'game-123' },
                skillRating: 1500,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.create.mockReturnValue(mockQueueEntry as any);

            const startTime = Date.now();
            const result = await service.joinQueue({
                playerId: 'player-123',
                gameId: game.id,
                skillRating: 1500,
            });
            const endTime = Date.now();

            expect(result).toBeDefined();
            expect(result.status).toBe(QueueStatus.QUEUED);

            // Should complete despite delays (< 1 second total)
            expect(endTime - startTime).toBeLessThan(1000);
        });

        it('should handle operations that timeout and recover', async () => {
            let attemptCount = 0;

            scrimQueueRepository.findOne.mockImplementation(async () => {
                attemptCount++;
                if (attemptCount === 1) {
                    // First attempt times out
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    throw new Error('Operation timed out');
                }
                // Subsequent attempts succeed
                return null;
            });

            scrimRepository.findOne.mockResolvedValue(null);

            const mockQueueEntry = {
                id: 'test-id',
                player: { id: 'player-id' },
                game: { id: 'game-123' },
                skillRating: 1500,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.create.mockReturnValue(mockQueueEntry as any);
            scrimQueueRepository.save.mockResolvedValue(mockQueueEntry as any);

            // First attempt should fail
            await expect(
                service.joinQueue({
                    playerId: 'player-123',
                    gameId: 'game-123',
                    skillRating: 1500,
                })
            ).rejects.toThrow('Operation timed out');

            // Reset attempt count and try again
            attemptCount = 0;

            // Second attempt should succeed
            const result = await service.joinQueue({
                playerId: 'player-123',
                gameId: 'game-123',
                skillRating: 1500,
            });

            expect(result).toBeDefined();
            expect(result.status).toBe(QueueStatus.QUEUED);
        });
    });

    describe('Memory and resource management', () => {
        it('should handle large queue datasets without memory leaks', async () => {
            const game = { id: 'game-123' };
            const largeDatasetSize = 10000;

            // Create a very large mock dataset
            const largeDataset = Array(largeDatasetSize).fill(null).map((_, index) => ({
                id: `queue-${index}`,
                game: { id: game.id },
                queuedAt: new Date(Date.now() - index * 100),
                status: QueueStatus.QUEUED,
            }));

            scrimQueueRepository.find.mockResolvedValue(largeDataset as any);

            // Measure memory before operation
            const initialMemory = process.memoryUsage();

            const startTime = Date.now();
            const stats = await service.getQueueStats();
            const endTime = Date.now();

            // Measure memory after operation
            const finalMemory = process.memoryUsage();

            expect(stats.totalQueued).toBe(largeDatasetSize);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

            // Memory usage should not increase dramatically
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
        });

        it('should efficiently process matchmaking with memory constraints', async () => {
            const game = { id: 'game-123', gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const playerCount = 5000;

            // Create large dataset
            const mockPlayers = Array(playerCount).fill(null).map((_, index) => ({
                id: `queue-${index}`,
                player: { id: `player-${index}` },
                game: { id: game.id },
                skillRating: 1000 + (index % 2000),
                queuedAt: new Date(Date.now() - index * 10),
                status: QueueStatus.QUEUED,
            }));

            gameRepository.find.mockResolvedValue([game] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(game as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);

            const mockScrim = {
                id: 'scrim-123',
                players: [{ id: 'player-1' }, { id: 'player-2' }],
                game: { id: game.id },
                gameMode: { id: 'mode-1' },
                skillGroup: { id: 'skill-1' },
            };
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const startTime = Date.now();
            const matches = await service.processMatchmaking();
            const endTime = Date.now();

            expect(matches.length).toBeGreaterThan(0);
            expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds

            // Verify no memory issues during processing
            const memoryUsage = process.memoryUsage();
            expect(memoryUsage.heapUsed).toBeLessThan(500 * 1024 * 1024); // Less than 500MB heap usage
        });
    });

    describe('Edge case error scenarios', () => {
        it('should handle corrupted queue data gracefully', async () => {
            const game = { id: 'game-123' };

            // Create corrupted data
            const corruptedData = [
                {
                    id: 'queue-1',
                    player: null, // Missing player
                    game: { id: game.id },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: null, // Missing game
                    skillRating: 1600,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-3',
                    player: { id: 'player-3' },
                    game: { id: game.id },
                    skillRating: NaN, // Invalid skill rating
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            scrimQueueRepository.find.mockResolvedValue(corruptedData as any);

            // Should not crash, should handle gracefully
            const matches = await service.processMatchmaking();

            // Should either skip corrupted entries or handle them without crashing
            expect(() => service.processMatchmaking()).not.toThrow();
        });

        it('should handle circular references in data', async () => {
            const game = { id: 'game-123' };

            // Create data with potential circular references
            const player1 = { id: 'player-1' };
            const player2 = { id: 'player-2' };

            // Add circular reference (in real scenario, this might be through relations)
            (player1 as any).friend = player2;
            (player2 as any).friend = player1;

            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: player1,
                    game: { id: game.id },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: player2,
                    game: { id: game.id },
                    skillRating: 1600,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);

            // Should handle circular references without stack overflow
            const matches = await service.processMatchmaking();
            expect(() => service.processMatchmaking()).not.toThrow();
        });

        it('should handle extremely long queue wait times', async () => {
            const game = { id: 'game-123' };

            // Create entries with extremely long wait times
            const ancientEntries = Array(10).fill(null).map((_, index) => ({
                id: `queue-${index}`,
                game: { id: game.id },
                queuedAt: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // 1 year ago
                status: QueueStatus.QUEUED,
            }));

            scrimQueueRepository.find.mockResolvedValue(ancientEntries as any);

            const stats = await service.getQueueStats();

            expect(stats.totalQueued).toBe(10);
            expect(stats.averageWaitTime).toBeGreaterThan(365 * 24 * 60 * 60 * 1000); // More than 1 year
            expect(isFinite(stats.averageWaitTime)).toBe(true); // Should not be infinite
        });
    });

    describe('Resource cleanup and finalization', () => {
        it('should properly clean up resources after operations', async () => {
            const game = { id: 'game-123' };
            const mockPlayers = Array(100).fill(null).map((_, index) => ({
                id: `queue-${index}`,
                player: { id: `player-${index}` },
                game: { id: game.id },
                skillRating: 1500 + index,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            }));

            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);

            // Perform operations
            await service.getQueueStats();
            await service.processMatchmaking();

            // Force garbage collection if available (in test environment)
            if (global.gc) {
                global.gc();
            }

            // Memory should be reasonable after operations
            const finalMemory = process.memoryUsage();
            expect(finalMemory.heapUsed).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
        });
    });
});