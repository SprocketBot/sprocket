import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScrimQueueEntity, QueueStatus } from '../../db/scrim_queue/scrim_queue.entity';
import { ScrimQueueRepository } from '../../db/scrim_queue/scrim_queue.repository';
import { ScrimTimeoutRepository } from '../../db/scrim_timeout/scrim_timeout.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameRepository } from '../../db/game/game.repository';
import { ScrimRepository } from '../../db/scrim/scrim.repository';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import { EventsService } from '@sprocketbot/lib';
import { GuidService } from '@sprocketbot/lib';
import { RpcException } from '@nestjs/microservices';
import { ObservabilityService } from '@sprocketbot/lib';
import { ScrimEntity, ScrimState } from '../../db/scrim/scrim.entity';
import { GameEntity } from '../../db/game/game.entity';
import { PlayerEntity } from '../../db/player/player.entity';
import { GameModeEntity } from '../../db/game_mode/game_mode.entity';
import { SkillGroupEntity } from '../../db/skill_group/skill_group.entity';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('QueueService', () => {
    let service: QueueService;
    let scrimQueueRepository: any;
    let scrimTimeoutRepository: any;
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
                    provide: ScrimTimeoutRepository,
                    useValue: {},
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

    describe('Service Definition', () => {
        it('should be defined', () => {
            expect(service).toBeDefined();
        });
    });

    describe('joinQueue', () => {
        const validPayload = {
            playerId: 'player-123',
            gameId: 'game-123',
            skillRating: 1500,
        };

        it('should successfully add player to queue', async () => {
            // Mock no existing queue entry
            scrimQueueRepository.findOne.mockResolvedValue(null);

            // Mock no active scrim
            scrimRepository.findOne.mockResolvedValue(null);

            // Mock successful save
            const mockQueueEntry = {
                id: 'test-id',
                player: { id: validPayload.playerId },
                game: { id: validPayload.gameId },
                skillRating: validPayload.skillRating,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.create.mockReturnValue(mockQueueEntry as any);
            scrimQueueRepository.save.mockResolvedValue(mockQueueEntry as any);

            const result = await service.joinQueue(validPayload);

            expect(result).toEqual(mockQueueEntry);
            expect(scrimQueueRepository.create).toHaveBeenCalledWith({
                id: 'test-id',
                player: { id: validPayload.playerId },
                game: { id: validPayload.gameId },
                skillRating: validPayload.skillRating,
                queuedAt: expect.any(Date),
                status: QueueStatus.QUEUED,
            });
            expect(scrimQueueRepository.save).toHaveBeenCalledWith(mockQueueEntry);
            expect(observabilityService.incrementCounter).toHaveBeenCalledWith('queue.join', {
                gameId: validPayload.gameId,
                skillRating: validPayload.skillRating.toString(),
            });
        });

        it('should throw error if player is already in queue', async () => {
            // Mock existing queue entry
            const existingEntry = {
                id: 'existing-id',
                player: { id: validPayload.playerId },
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.findOne.mockResolvedValue(existingEntry as any);

            await expect(service.joinQueue(validPayload)).rejects.toThrow(RpcException);
            await expect(service.joinQueue(validPayload)).rejects.toThrow('Player is already in queue');
        });

        it('should throw error if player is in active scrim', async () => {
            // Mock no existing queue entry
            scrimQueueRepository.findOne.mockResolvedValue(null);

            // Mock active scrim
            const activeScrim = {
                id: 'scrim-123',
                players: [{ id: validPayload.playerId }],
                state: ScrimState.IN_PROGRESS,
            };
            scrimRepository.findOne.mockResolvedValue(activeScrim as any);

            await expect(service.joinQueue(validPayload)).rejects.toThrow(RpcException);
            await expect(service.joinQueue(validPayload)).rejects.toThrow('Player is already in an active scrim');
        });

        it('should handle database errors gracefully', async () => {
            // Mock no existing queue entry
            scrimQueueRepository.findOne.mockResolvedValue(null);

            // Mock no active scrim
            scrimRepository.findOne.mockResolvedValue(null);

            // Mock database error
            scrimQueueRepository.save.mockRejectedValue(new Error('Database connection failed'));

            await expect(service.joinQueue(validPayload)).rejects.toThrow('Database connection failed');
        });

        it('should trigger matchmaking after successful join', async () => {
            // Mock no existing queue entry
            scrimQueueRepository.findOne.mockResolvedValue(null);

            // Mock no active scrim
            scrimRepository.findOne.mockResolvedValue(null);

            // Mock successful save
            const mockQueueEntry = {
                id: 'test-id',
                player: { id: validPayload.playerId },
                game: { id: validPayload.gameId },
                skillRating: validPayload.skillRating,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.create.mockReturnValue(mockQueueEntry as any);
            scrimQueueRepository.save.mockResolvedValue(mockQueueEntry as any);

            // Mock processMatchmaking to verify it's called
            const processMatchmakingSpy = vi.spyOn(service, 'processMatchmaking').mockResolvedValue([]);

            await service.joinQueue(validPayload);

            expect(processMatchmakingSpy).toHaveBeenCalled();
            processMatchmakingSpy.mockRestore();
        });
    });

    describe('leaveQueue', () => {
        const validPayload = {
            playerId: 'player-123',
        };

        it('should successfully remove player from queue', async () => {
            const existingEntry = {
                id: 'queue-id',
                player: { id: validPayload.playerId },
                status: QueueStatus.QUEUED,
                game: { id: 'game-123' },
            };
            scrimQueueRepository.findOne.mockResolvedValue(existingEntry as any);
            scrimQueueRepository.save.mockResolvedValue({ ...existingEntry, status: QueueStatus.CANCELLED } as any);

            const result = await service.leaveQueue(validPayload);

            expect(result).toBe(true);
            expect(scrimQueueRepository.save).toHaveBeenCalledWith({
                ...existingEntry,
                status: QueueStatus.CANCELLED,
            });
            expect(observabilityService.incrementCounter).toHaveBeenCalledWith('queue.leave', {
                gameId: existingEntry.game.id,
            });
        });

        it('should throw error if player is not in queue', async () => {
            scrimQueueRepository.findOne.mockResolvedValue(null);

            await expect(service.leaveQueue(validPayload)).rejects.toThrow(RpcException);
            await expect(service.leaveQueue(validPayload)).rejects.toThrow('Player is not in queue');
        });

        it('should handle database errors gracefully', async () => {
            const existingEntry = {
                id: 'queue-id',
                player: { id: validPayload.playerId },
                status: QueueStatus.QUEUED,
                game: { id: 'game-123' },
            };
            scrimQueueRepository.findOne.mockResolvedValue(existingEntry as any);
            scrimQueueRepository.save.mockRejectedValue(new Error('Database connection failed'));

            await expect(service.leaveQueue(validPayload)).rejects.toThrow('Database connection failed');
        });
    });

    describe('getQueueStatus', () => {
        const validPayload = {
            playerId: 'player-123',
        };

        it('should return queue status for player', async () => {
            const queueEntry = {
                id: 'queue-id',
                player: { id: validPayload.playerId, name: 'Test Player' },
                game: { id: 'game-123', name: 'Test Game' },
                skillRating: 1500,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.findOne.mockResolvedValue(queueEntry as any);

            const result = await service.getQueueStatus(validPayload);

            expect(result).toEqual(queueEntry);
            expect(scrimQueueRepository.findOne).toHaveBeenCalledWith({
                where: {
                    player: { id: validPayload.playerId },
                    status: QueueStatus.QUEUED,
                },
                relations: ['player', 'game'],
            });
        });

        it('should return null if player is not in queue', async () => {
            scrimQueueRepository.findOne.mockResolvedValue(null);

            const result = await service.getQueueStatus(validPayload);

            expect(result).toBeNull();
        });
    });

    describe('getQueuePosition', () => {
        it('should return correct queue position', async () => {
            const playerId = 'player-123';
            const gameId = 'game-123';

            const queueEntry = {
                id: 'queue-id',
                player: { id: playerId },
                game: { id: gameId },
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.findOne.mockResolvedValue(queueEntry as any);

            const queuedPlayers = [
                { id: 'queue-1', player: { id: 'player-1' } },
                { id: 'queue-2', player: { id: playerId } },
                { id: 'queue-3', player: { id: 'player-3' } },
            ];
            scrimQueueRepository.find.mockResolvedValue(queuedPlayers as any);

            const result = await service.getQueuePosition(playerId);

            expect(result).toBe(2); // Position 2 (0-indexed + 1)
        });

        it('should return -1 if player is not in queue', async () => {
            scrimQueueRepository.findOne.mockResolvedValue(null);

            const result = await service.getQueuePosition('player-123');

            expect(result).toBe(-1);
        });
    });

    describe('getQueuedPlayers', () => {
        it('should return all queued players for a game', async () => {
            const gameId = 'game-123';
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1', name: 'Player 1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2', name: 'Player 2' },
                    game: { id: gameId },
                    skillRating: 1600,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);

            const result = await service.getQueuedPlayers(gameId);

            expect(result).toEqual(mockPlayers);
            expect(scrimQueueRepository.find).toHaveBeenCalledWith({
                where: {
                    game: { id: gameId },
                    status: QueueStatus.QUEUED,
                },
                relations: ['player', 'game'],
                order: { queuedAt: 'ASC' },
            });
        });

        it('should return empty array when no players queued', async () => {
            const gameId = 'game-123';
            scrimQueueRepository.find.mockResolvedValue([]);

            const result = await service.getQueuedPlayers(gameId);

            expect(result).toEqual([]);
        });
    });

    describe('processMatchmaking', () => {
        it('should create matches for players with similar skill ratings', async () => {
            const gameId = 'game-123';
            const mockGame = { id: gameId, gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: gameId },
                    skillRating: 1550,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];
            const mockScrim = {
                id: 'scrim-123',
                players: [{ id: 'player-1' }, { id: 'player-2' }],
                game: { id: gameId },
                gameMode: { id: 'mode-1' },
                skillGroup: { id: 'skill-1' },
            };

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(mockGame as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                scrimId: 'scrim-123',
                players: ['player-1', 'player-2'],
                gameId: gameId,
                skillRating: 1525, // Average of 1500 and 1550
            });
            expect(scrimCrudService.createScrim).toHaveBeenCalled();
            expect(eventService.publish).toHaveBeenCalled();
        });

        it('should handle games with no queued players', async () => {
            const gameId = 'game-123';
            const mockGame = { id: gameId };

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue([]);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(0);
            expect(scrimCrudService.createScrim).not.toHaveBeenCalled();
        });

        it('should handle games with only one queued player', async () => {
            const gameId = 'game-123';
            const mockGame = { id: gameId };
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(0);
            expect(scrimCrudService.createScrim).not.toHaveBeenCalled();
        });

        it('should handle errors during scrim creation gracefully', async () => {
            const gameId = 'game-123';
            const mockGame = { id: gameId, gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: gameId },
                    skillRating: 1550,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(mockGame as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);
            scrimCrudService.createScrim.mockRejectedValue(new Error('Scrim creation failed'));

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(0);
            expect(observabilityService.incrementCounter).toHaveBeenCalledWith('queue.matchmaking.error', {
                error: expect.any(String),
            });
        });
    });

    describe('cleanupExpiredQueues', () => {
        it('should clean up expired queue entries', async () => {
            const expiredEntry = {
                id: 'expired-queue',
                status: QueueStatus.QUEUED,
                queuedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
            };

            scrimQueueRepository.find.mockResolvedValue([expiredEntry] as any);
            scrimQueueRepository.save.mockResolvedValue({ ...expiredEntry, status: QueueStatus.EXPIRED } as any);

            const result = await service.cleanupExpiredQueues();

            expect(result).toBe(1);
            expect(scrimQueueRepository.save).toHaveBeenCalledWith({
                ...expiredEntry,
                status: QueueStatus.EXPIRED,
            });
        });

        it('should return 0 when no expired entries', async () => {
            scrimQueueRepository.find.mockResolvedValue([]);

            const result = await service.cleanupExpiredQueues();

            expect(result).toBe(0);
            expect(scrimQueueRepository.save).not.toHaveBeenCalled();
        });

        it('should handle database errors during cleanup', async () => {
            const expiredEntry = {
                id: 'expired-queue',
                status: QueueStatus.QUEUED,
                queuedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
            };

            scrimQueueRepository.find.mockResolvedValue([expiredEntry] as any);
            scrimQueueRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.cleanupExpiredQueues()).rejects.toThrow('Database error');
        });
    });

    describe('getQueueStats', () => {
        it('should return queue statistics', async () => {
            const mockEntries = [
                {
                    id: 'queue-1',
                    game: { id: 'game-123' },
                    queuedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    game: { id: 'game-123' },
                    queuedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-3',
                    game: { id: 'game-456' },
                    queuedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                    status: QueueStatus.QUEUED,
                },
            ];
            scrimQueueRepository.find.mockResolvedValue(mockEntries as any);

            const result = await service.getQueueStats();

            expect(result.totalQueued).toBe(3);
            expect(result.averageWaitTime).toBeGreaterThan(0);
            expect(result.gameStats).toHaveLength(2);
            expect(result.gameStats.find(gs => gs.gameId === 'game-123')?.queuedCount).toBe(2);
            expect(result.gameStats.find(gs => gs.gameId === 'game-456')?.queuedCount).toBe(1);
        });

        it('should return empty stats when no queued players', async () => {
            scrimQueueRepository.find.mockResolvedValue([]);

            const result = await service.getQueueStats();

            expect(result.totalQueued).toBe(0);
            expect(result.averageWaitTime).toBe(0);
            expect(result.gameStats).toHaveLength(0);
        });

        it('should filter stats by game ID', async () => {
            const gameId = 'game-123';
            const mockEntries = [
                {
                    id: 'queue-1',
                    game: { id: gameId },
                    queuedAt: new Date(Date.now() - 5 * 60 * 1000),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    game: { id: 'game-456' },
                    queuedAt: new Date(Date.now() - 10 * 60 * 1000),
                    status: QueueStatus.QUEUED,
                },
            ];
            scrimQueueRepository.find.mockResolvedValue([mockEntries[0]] as any);

            const result = await service.getQueueStats(gameId);

            expect(result.totalQueued).toBe(1);
            expect(result.gameStats).toHaveLength(1);
            expect(result.gameStats[0].gameId).toBe(gameId);
        });
    });

    describe('Skill-based matching algorithm', () => {
        it('should match players within initial skill range', async () => {
            const gameId = 'game-123';
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: gameId },
                    skillRating: 1550,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-3',
                    player: { id: 'player-3' },
                    game: { id: gameId },
                    skillRating: 1600,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            const mockGame = { id: gameId, gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const mockScrim = { id: 'scrim-123', players: [{ id: 'player-1' }, { id: 'player-2' }] };

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(mockGame as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(1);
            expect(results[0].players).toHaveLength(2);
            expect(results[0].skillRating).toBe(1525); // Average of 1500 and 1550
        });

        it('should expand skill range when no matches found', async () => {
            const gameId = 'game-123';
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: gameId },
                    skillRating: 1700, // 200 points difference
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            const mockGame = { id: gameId, gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const mockScrim = { id: 'scrim-123', players: [{ id: 'player-1' }, { id: 'player-2' }] };

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(mockGame as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(1);
            expect(results[0].players).toHaveLength(2);
            expect(results[0].skillRating).toBe(1600); // Average of 1500 and 1700
        });

        it('should handle players with exact same skill rating', async () => {
            const gameId = 'game-123';
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            const mockGame = { id: gameId, gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const mockScrim = { id: 'scrim-123', players: [{ id: 'player-1' }, { id: 'player-2' }] };

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(mockGame as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: { id: 'skill-1' } } as any);
            scrimCrudService.createScrim.mockResolvedValue(mockScrim as any);
            scrimCrudService.addUserToScrim.mockResolvedValue(mockScrim as any);
            scrimQueueRepository.save.mockResolvedValue({} as any);
            scrimRepository.findOne.mockResolvedValue(mockScrim as any);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(1);
            expect(results[0].players).toHaveLength(2);
            expect(results[0].skillRating).toBe(1500);
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle missing game modes gracefully', async () => {
            const gameId = 'game-123';
            const mockGame = { id: gameId, gameModes: [], skillGroups: [{ id: 'skill-1' }] };
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: gameId },
                    skillRating: 1550,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(0);
        });

        it('should handle missing player skill group gracefully', async () => {
            const gameId = 'game-123';
            const mockGame = { id: gameId, gameModes: [{ id: 'mode-1' }], skillGroups: [{ id: 'skill-1' }] };
            const mockPlayers = [
                {
                    id: 'queue-1',
                    player: { id: 'player-1' },
                    game: { id: gameId },
                    skillRating: 1500,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
                {
                    id: 'queue-2',
                    player: { id: 'player-2' },
                    game: { id: gameId },
                    skillRating: 1550,
                    queuedAt: new Date(),
                    status: QueueStatus.QUEUED,
                },
            ];

            gameRepository.find.mockResolvedValue([mockGame] as any);
            scrimQueueRepository.find.mockResolvedValue(mockPlayers as any);
            gameRepository.findOne.mockResolvedValue(mockGame as any);
            playerRepository.findOne.mockResolvedValue({ id: 'player-1', skillGroup: null } as any);

            const results = await service.processMatchmaking();

            expect(results).toHaveLength(0);
        });

        it('should handle concurrent queue operations', async () => {
            const payload = {
                playerId: 'player-123',
                gameId: 'game-123',
                skillRating: 1500,
            };

            // Mock no existing queue entry
            scrimQueueRepository.findOne.mockResolvedValue(null);

            // Mock no active scrim
            scrimRepository.findOne.mockResolvedValue(null);

            // Mock successful save
            const mockQueueEntry = {
                id: 'test-id',
                player: { id: payload.playerId },
                game: { id: payload.gameId },
                skillRating: payload.skillRating,
                queuedAt: new Date(),
                status: QueueStatus.QUEUED,
            };
            scrimQueueRepository.create.mockReturnValue(mockQueueEntry as any);
            scrimQueueRepository.save.mockResolvedValue(mockQueueEntry as any);

            // Simulate concurrent join requests
            const promises = [
                service.joinQueue(payload),
                service.joinQueue(payload),
                service.joinQueue(payload),
            ];

            // All should succeed since they're the same player (idempotent)
            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result).toEqual(mockQueueEntry);
            });
        });
    });
});