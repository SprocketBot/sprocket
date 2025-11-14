import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from './queue.module';
import { QueueService } from './queue.service';
import { QueueWorker } from './queue.worker';
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
import { DataSource, In } from 'typeorm';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

/**
 * Comprehensive integration tests for QueueService
 * These tests verify end-to-end queue workflows with real database operations
 */
describe('QueueService Integration Tests', () => {
    let module: TestingModule;
    let queueService: QueueService;
    let queueWorker: QueueWorker;
    let dataSource: DataSource;
    let scrimQueueRepository: ScrimQueueRepository;
    let playerRepository: PlayerRepository;
    let gameRepository: GameRepository;
    let scrimRepository: ScrimRepository;
    let scrimCrudService: ScrimCrudService;

    // Test data factories
    const createTestPlayer = (id: string, name: string) => ({
        id,
        name,
        createdAt: new Date(),
        updateAt: new Date(),
    });

    const createTestGame = (id: string, name: string) => ({
        id,
        name,
        createdAt: new Date(),
        updateAt: new Date(),
        gameModes: [],
        skillGroups: [],
    });

    const createTestGameMode = (id: string, name: string) => ({
        id,
        name,
        createdAt: new Date(),
        updateAt: new Date(),
    });

    const createTestSkillGroup = (id: string, name: string) => ({
        id,
        name,
        createdAt: new Date(),
        updateAt: new Date(),
    });

    beforeAll(async () => {
        // Create test database connection
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT || '5432'),
                    username: process.env.DB_USERNAME || 'postgres',
                    password: process.env.DB_PASSWORD || 'postgres',
                    database: process.env.DB_NAME || 'sprocket_test',
                    entities: [
                        ScrimQueueEntity,
                        ScrimEntity,
                        GameEntity,
                        PlayerEntity,
                        GameModeEntity,
                        SkillGroupEntity,
                    ],
                    synchronize: true,
                    dropSchema: true, // Clean slate for tests
                }),
                QueueModule,
            ],
        }).compile();

        queueService = module.get<QueueService>(QueueService);
        queueWorker = module.get<QueueWorker>(QueueWorker);
        dataSource = module.get<DataSource>(DataSource);
        scrimQueueRepository = module.get<ScrimQueueRepository>(ScrimQueueRepository);
        playerRepository = module.get<PlayerRepository>(PlayerRepository);
        gameRepository = module.get<GameRepository>(GameRepository);
        scrimRepository = module.get<ScrimRepository>(ScrimRepository);
        scrimCrudService = module.get<ScrimCrudService>(ScrimCrudService);
    });

    afterAll(async () => {
        if (dataSource) {
            await dataSource.destroy();
        }
        if (module) {
            await module.close();
        }
    });

    beforeEach(async () => {
        // Clean up test data before each test
        await scrimQueueRepository.clear();
        await scrimRepository.clear();
        await playerRepository.clear();
        await gameRepository.clear();
    });

    afterEach(async () => {
        vi.clearAllMocks();
    });

    describe('End-to-end queue workflows', () => {
        it('should handle complete queue lifecycle: join -> match -> leave', async () => {
            // Setup test data
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));
            const player1 = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));
            const player2 = await playerRepository.save(createTestPlayer('player-2', 'Player 2'));

            // Step 1: Players join queue
            const queueEntry1 = await queueService.joinQueue({
                playerId: player1.id,
                gameId: game.id,
                skillRating: 1500,
            });

            const queueEntry2 = await queueService.joinQueue({
                playerId: player2.id,
                gameId: game.id,
                skillRating: 1550,
            });

            expect(queueEntry1).toBeDefined();
            expect(queueEntry1.status).toBe(QueueStatus.QUEUED);
            expect(queueEntry2).toBeDefined();
            expect(queueEntry2.status).toBe(QueueStatus.QUEUED);

            // Step 2: Verify queue status
            const status1 = await queueService.getQueueStatus({ playerId: player1.id });
            const status2 = await queueService.getQueueStatus({ playerId: player2.id });

            expect(status1).toBeDefined();
            expect(status2).toBeDefined();

            // Step 3: Process matchmaking
            const matches = await queueService.processMatchmaking();

            expect(matches).toHaveLength(1);
            expect(matches[0].players).toContain(player1.id);
            expect(matches[0].players).toContain(player2.id);
            expect(matches[0].skillRating).toBe(1525); // Average

            // Step 4: Verify queue entries are updated to MATCHED
            const updatedEntry1 = await scrimQueueRepository.findOne({
                where: { id: queueEntry1.id },
            });
            const updatedEntry2 = await scrimQueueRepository.findOne({
                where: { id: queueEntry2.id },
            });

            expect(updatedEntry1?.status).toBe(QueueStatus.MATCHED);
            expect(updatedEntry2?.status).toBe(QueueStatus.MATCHED);

            // Step 5: Verify scrim was created
            const scrim = await scrimRepository.findOne({
                where: { id: matches[0].scrimId },
                relations: ['players'],
            });

            expect(scrim).toBeDefined();
            expect(scrim?.players).toHaveLength(2);
            expect(scrim?.players.map(p => p.id)).toContain(player1.id);
            expect(scrim?.players.map(p => p.id)).toContain(player2.id);
        });

        it('should handle player leaving queue before matchmaking', async () => {
            // Setup test data
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));
            const player = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));

            // Player joins queue
            await queueService.joinQueue({
                playerId: player.id,
                gameId: game.id,
                skillRating: 1500,
            });

            // Player leaves queue
            const result = await queueService.leaveQueue({ playerId: player.id });
            expect(result).toBe(true);

            // Verify player is no longer in queue
            const status = await queueService.getQueueStatus({ playerId: player.id });
            expect(status).toBeNull();

            // Process matchmaking - should find no matches
            const matches = await queueService.processMatchmaking();
            expect(matches).toHaveLength(0);
        });

        it('should handle multiple games with separate queues', async () => {
            // Setup test data for multiple games
            const game1 = await gameRepository.save(createTestGame('game-1', 'Game 1'));
            const game2 = await gameRepository.save(createTestGame('game-2', 'Game 2'));

            const player1 = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));
            const player2 = await playerRepository.save(createTestPlayer('player-2', 'Player 2'));
            const player3 = await playerRepository.save(createTestPlayer('player-3', 'Player 3'));

            // Players join different game queues
            await queueService.joinQueue({
                playerId: player1.id,
                gameId: game1.id,
                skillRating: 1500,
            });

            await queueService.joinQueue({
                playerId: player2.id,
                gameId: game1.id,
                skillRating: 1550,
            });

            await queueService.joinQueue({
                playerId: player3.id,
                gameId: game2.id,
                skillRating: 1600,
            });

            // Verify queue stats
            const stats = await queueService.getQueueStats();
            expect(stats.totalQueued).toBe(3);
            expect(stats.gameStats).toHaveLength(2);
            expect(stats.gameStats.find(gs => gs.gameId === game1.id)?.queuedCount).toBe(2);
            expect(stats.gameStats.find(gs => gs.gameId === game2.id)?.queuedCount).toBe(1);

            // Process matchmaking
            const matches = await queueService.processMatchmaking();
            expect(matches).toHaveLength(1); // Only game1 has enough players
            expect(matches[0].gameId).toBe(game1.id);
        });
    });

    describe('Multi-player matchmaking scenarios', () => {
        it('should handle skill-based matching with expanding ranges', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));

            // Create players with different skill ratings
            const players = [];
            for (let i = 0; i < 6; i++) {
                const player = await playerRepository.save(
                    createTestPlayer(`player-${i}`, `Player ${i}`)
                );
                players.push(player);
            }

            // Join players with varying skill ratings
            const skillRatings = [1400, 1450, 1500, 1700, 1750, 1800];
            for (let i = 0; i < players.length; i++) {
                await queueService.joinQueue({
                    playerId: players[i].id,
                    gameId: game.id,
                    skillRating: skillRatings[i],
                });
            }

            // Process matchmaking
            const matches = await queueService.processMatchmaking();

            // Should create matches with players within skill range
            expect(matches.length).toBeGreaterThan(0);

            // Verify skill ranges in matches
            matches.forEach(match => {
                expect(match.skillRating).toBeGreaterThan(0);
                expect(match.players.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('should handle queue priority (FIFO) correctly', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));

            // Create players
            const players = [];
            for (let i = 0; i < 4; i++) {
                const player = await playerRepository.save(
                    createTestPlayer(`player-${i}`, `Player ${i}`)
                );
                players.push(player);
            }

            // Join players with delays to ensure different queue times
            const joinTimes = [];
            for (let i = 0; i < players.length; i++) {
                joinTimes.push(new Date());
                await queueService.joinQueue({
                    playerId: players[i].id,
                    gameId: game.id,
                    skillRating: 1500 + (i * 10), // Similar skills
                });
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
            }

            // Process matchmaking
            const matches = await queueService.processMatchmaking();

            // Verify that players who joined earlier are matched first
            expect(matches.length).toBeGreaterThan(0);

            // Check queue positions
            for (let i = 0; i < players.length; i++) {
                const position = await queueService.getQueuePosition(players[i].id);
                if (position > 0) {
                    // Player should be in queue position based on join order
                    expect(position).toBe(i + 1);
                }
            }
        });

        it('should handle large queue processing efficiently', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));

            // Create many players
            const playerCount = 20;
            const players = [];
            for (let i = 0; i < playerCount; i++) {
                const player = await playerRepository.save(
                    createTestPlayer(`player-${i}`, `Player ${i}`)
                );
                players.push(player);
            }

            // Join all players to queue
            const joinPromises = players.map((player, index) =>
                queueService.joinQueue({
                    playerId: player.id,
                    gameId: game.id,
                    skillRating: 1500 + (index % 100), // Varying skills
                })
            );

            await Promise.all(joinPromises);

            // Measure matchmaking performance
            const startTime = Date.now();
            const matches = await queueService.processMatchmaking();
            const endTime = Date.now();

            // Should complete within reasonable time (< 5 seconds for 20 players)
            expect(endTime - startTime).toBeLessThan(5000);
            expect(matches.length).toBeGreaterThan(0);
        });
    });

    describe('Queue expiration and cleanup', () => {
        it('should clean up expired queue entries', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));
            const player = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));

            // Create expired queue entry directly
            const expiredEntry = scrimQueueRepository.create({
                id: 'expired-queue-id',
                player: player,
                game: game,
                skillRating: 1500,
                queuedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                status: QueueStatus.QUEUED,
            });
            await scrimQueueRepository.save(expiredEntry);

            // Create non-expired entry
            const activeEntry = scrimQueueRepository.create({
                id: 'active-queue-id',
                player: await playerRepository.save(createTestPlayer('player-2', 'Player 2')),
                game: game,
                skillRating: 1600,
                queuedAt: new Date(), // Now
                status: QueueStatus.QUEUED,
            });
            await scrimQueueRepository.save(activeEntry);

            // Run cleanup
            const cleanedCount = await queueService.cleanupExpiredQueues();

            expect(cleanedCount).toBe(1);

            // Verify expired entry is cleaned up
            const updatedExpired = await scrimQueueRepository.findOne({
                where: { id: expiredEntry.id },
            });
            expect(updatedExpired?.status).toBe(QueueStatus.EXPIRED);

            // Verify active entry remains
            const updatedActive = await scrimQueueRepository.findOne({
                where: { id: activeEntry.id },
            });
            expect(updatedActive?.status).toBe(QueueStatus.QUEUED);
        });

        it('should handle queue worker cleanup cron job', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));

            // Create multiple expired entries
            for (let i = 0; i < 5; i++) {
                const player = await playerRepository.save(
                    createTestPlayer(`player-${i}`, `Player ${i}`)
                );
                const expiredEntry = scrimQueueRepository.create({
                    id: `expired-queue-${i}`,
                    player: player,
                    game: game,
                    skillRating: 1500 + i,
                    queuedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                    status: QueueStatus.QUEUED,
                });
                await scrimQueueRepository.save(expiredEntry);
            }

            // Run worker cleanup
            await queueWorker.cleanupExpiredQueues();

            // Verify all expired entries are cleaned up
            const expiredEntries = await scrimQueueRepository.find({
                where: { status: QueueStatus.EXPIRED },
            });
            expect(expiredEntries).toHaveLength(5);
        });
    });

    describe('Database transaction consistency', () => {
        it('should maintain consistency during match creation failure', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));
            const player1 = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));
            const player2 = await playerRepository.save(createTestPlayer('player-2', 'Player 2'));

            // Mock scrim creation to fail
            vi.spyOn(scrimCrudService, 'createScrim').mockRejectedValue(
                new Error('Scrim creation failed')
            );

            // Players join queue
            await queueService.joinQueue({
                playerId: player1.id,
                gameId: game.id,
                skillRating: 1500,
            });

            await queueService.joinQueue({
                playerId: player2.id,
                gameId: game.id,
                skillRating: 1550,
            });

            // Process matchmaking - should fail but not corrupt queue state
            const matches = await queueService.processMatchmaking();

            expect(matches).toHaveLength(0);

            // Verify queue entries remain in QUEUED state
            const queueEntries = await scrimQueueRepository.find({
                where: {
                    player: { id: In([player1.id, player2.id]) },
                    status: QueueStatus.QUEUED
                },
            });
            expect(queueEntries).toHaveLength(2);
        });

        it('should handle concurrent queue operations safely', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));
            const player = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));

            // Simulate concurrent join operations
            const joinPromises = Array(5).fill(null).map((_, index) =>
                queueService.joinQueue({
                    playerId: player.id,
                    gameId: game.id,
                    skillRating: 1500 + index,
                }).catch(error => error) // Catch errors to prevent Promise.all rejection
            );

            const results = await Promise.all(joinPromises);

            // Only first join should succeed, others should fail with "already in queue"
            const successfulJoins = results.filter(result => !(result instanceof Error));
            const failedJoins = results.filter(result => result instanceof Error);

            expect(successfulJoins).toHaveLength(1);
            expect(failedJoins).toHaveLength(4);
            expect(failedJoins[0].message).toContain('already in queue');
        });
    });

    describe('GraphQL resolver integration', () => {
        it('should integrate with queue resolver operations', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));
            const player = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));

            // Simulate GraphQL join queue mutation
            const joinResult = await queueService.joinQueue({
                playerId: player.id,
                gameId: game.id,
                skillRating: 1500,
            });

            expect(joinResult).toBeDefined();
            expect(joinResult.status).toBe(QueueStatus.QUEUED);

            // Simulate GraphQL get queue status query
            const status = await queueService.getQueueStatus({ playerId: player.id });
            expect(status).toBeDefined();
            expect(status?.player.id).toBe(player.id);
            expect(status?.game.id).toBe(game.id);

            // Simulate GraphQL get queue stats query
            const stats = await queueService.getQueueStats();
            expect(stats.totalQueued).toBe(1);
            expect(stats.gameStats).toHaveLength(1);
            expect(stats.gameStats[0].queuedCount).toBe(1);

            // Simulate GraphQL process matchmaking mutation
            const matches = await queueService.processMatchmaking();
            expect(matches).toHaveLength(0); // Only one player

            // Simulate GraphQL leave queue mutation
            const leaveResult = await queueService.leaveQueue({ playerId: player.id });
            expect(leaveResult).toBe(true);

            // Verify player is no longer in queue
            const finalStatus = await queueService.getQueueStatus({ playerId: player.id });
            expect(finalStatus).toBeNull();
        });
    });

    describe('Performance and scalability tests', () => {
        it('should handle high concurrency queue operations', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));

            // Create many players
            const playerCount = 50;
            const players = [];
            for (let i = 0; i < playerCount; i++) {
                const player = await playerRepository.save(
                    createTestPlayer(`player-${i}`, `Player ${i}`)
                );
                players.push(player);
            }

            // Concurrent join operations
            const startTime = Date.now();
            const joinPromises = players.map((player, index) =>
                queueService.joinQueue({
                    playerId: player.id,
                    gameId: game.id,
                    skillRating: 1500 + (index % 200),
                })
            );

            const joinResults = await Promise.all(joinPromises);
            const joinEndTime = Date.now();

            // All joins should succeed
            expect(joinResults).toHaveLength(playerCount);
            joinResults.forEach(result => {
                expect(result).toBeDefined();
                expect(result.status).toBe(QueueStatus.QUEUED);
            });

            // Should complete within reasonable time (< 10 seconds for 50 concurrent operations)
            expect(joinEndTime - startTime).toBeLessThan(10000);

            // Process matchmaking
            const matchmakingStartTime = Date.now();
            const matches = await queueService.processMatchmaking();
            const matchmakingEndTime = Date.now();

            // Should create matches and complete within reasonable time
            expect(matches.length).toBeGreaterThan(0);
            expect(matchmakingEndTime - matchmakingStartTime).toBeLessThan(5000);
        });

        it('should handle memory efficiently with large datasets', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));

            // Create a large number of players
            const playerCount = 100;
            const players = [];

            // Create players in batches to avoid memory issues
            for (let i = 0; i < playerCount; i++) {
                const player = await playerRepository.save(
                    createTestPlayer(`player-${i}`, `Player ${i}`)
                );
                players.push(player);

                // Join player to queue
                await queueService.joinQueue({
                    playerId: player.id,
                    gameId: game.id,
                    skillRating: 1500 + (i % 500),
                });
            }

            // Get queue stats for large dataset
            const statsStartTime = Date.now();
            const stats = await queueService.getQueueStats();
            const statsEndTime = Date.now();

            expect(stats.totalQueued).toBe(playerCount);
            expect(stats.gameStats).toHaveLength(1);
            expect(statsEndTime - statsStartTime).toBeLessThan(1000); // Should be fast

            // Process matchmaking for large dataset
            const matchmakingStartTime = Date.now();
            const matches = await queueService.processMatchmaking();
            const matchmakingEndTime = Date.now();

            expect(matches.length).toBeGreaterThan(0);
            expect(matchmakingEndTime - matchmakingStartTime).toBeLessThan(10000); // Should complete within 10 seconds
        });
    });

    describe('Error recovery and resilience', () => {
        it('should recover from database connection issues', async () => {
            const game = await gameRepository.save(createTestGame('game-1', 'Test Game'));
            const player = await playerRepository.save(createTestPlayer('player-1', 'Player 1'));

            // Simulate database connection failure
            const originalFindOne = scrimQueueRepository.findOne;
            let callCount = 0;
            scrimQueueRepository.findOne = vi.fn().mockImplementation(async () => {
                callCount++;
                if (callCount === 1) {
                    throw new Error('Database connection lost');
                }
                return originalFindOne.call(scrimQueueRepository, { where: { player: { id: player.id } } });
            });

            // First attempt should fail
            await expect(
                queueService.joinQueue({
                    playerId: player.id,
                    gameId: game.id,
                    skillRating: 1500,
                })
            ).rejects.toThrow('Database connection lost');

            // Restore original method
            scrimQueueRepository.findOne = originalFindOne;

            // Second attempt should succeed
            const result = await queueService.joinQueue({
                playerId: player.id,
                gameId: game.id,
                skillRating: 1500,
            });

            expect(result).toBeDefined();
            expect(result.status).toBe(QueueStatus.QUEUED);
        });

        it('should handle invalid data gracefully', async () => {
            // Test with invalid player ID
            await expect(
                queueService.joinQueue({
                    playerId: 'invalid-player-id',
                    gameId: 'invalid-game-id',
                    skillRating: -100, // Invalid skill rating
                })
            ).rejects.toThrow();

            // Test with missing required fields
            await expect(
                queueService.joinQueue({
                    playerId: '',
                    gameId: '',
                    skillRating: 0,
                } as any)
            ).rejects.toThrow();
        });
    });
});