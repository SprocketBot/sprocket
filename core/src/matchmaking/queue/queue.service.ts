import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between, In } from 'typeorm';
import { ScrimQueueEntity, QueueStatus } from '../../db/scrim_queue/scrim_queue.entity';
import { ScrimQueueRepository } from '../../db/scrim_queue/scrim_queue.repository';
import { ScrimTimeoutRepository } from '../../db/scrim_timeout/scrim_timeout.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameRepository } from '../../db/game/game.repository';
import { ScrimRepository } from '../../db/scrim/scrim.repository';
import { ScrimEntity, ScrimState } from '../../db/scrim/scrim.entity';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import { EventsService } from '@sprocketbot/lib';
import { MatchmakingEvents } from '../constants';
import { GuidService } from '@sprocketbot/lib';
import { RpcException } from '@nestjs/microservices';
import { ObservabilityService } from '@sprocketbot/lib';

export interface QueuePlayerPayload {
    playerId: string;
    gameId: string;
    skillRating: number;
}

export interface QueueStatusPayload {
    playerId: string;
}

export interface LeaveQueuePayload {
    playerId: string;
}

export interface MatchmakingResult {
    scrimId: string;
    players: string[];
    gameId: string;
    skillRating: number;
}

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);
    private readonly SKILL_RANGE_INITIAL = 100;
    private readonly SKILL_RANGE_MAX = 500;
    private readonly SKILL_RANGE_INCREMENT = 50;
    private readonly QUEUE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
    private readonly MATCHMAKING_INTERVAL_MS = 5000; // 5 seconds

    constructor(
        @InjectRepository(ScrimQueueEntity)
        private readonly scrimQueueRepository: ScrimQueueRepository,
        private readonly scrimTimeoutRepository: ScrimTimeoutRepository,
        private readonly playerRepository: PlayerRepository,
        private readonly gameRepository: GameRepository,
        private readonly scrimRepository: ScrimRepository,
        private readonly scrimCrudService: ScrimCrudService,
        private readonly eventService: EventsService,
        private readonly guidService: GuidService,
        private readonly observabilityService: ObservabilityService,
    ) { }

    /**
     * Add a player to the matchmaking queue
     */
    async joinQueue(payload: QueuePlayerPayload): Promise<ScrimQueueEntity> {
        const { playerId, gameId, skillRating } = payload;

        // Check if player is already in queue
        const existingQueue = await this.scrimQueueRepository.findOne({
            where: {
                player: { id: playerId },
                status: QueueStatus.QUEUED,
            },
        });

        if (existingQueue) {
            throw new RpcException('Player is already in queue');
        }

        // Check if player is in an active scrim
        const activeScrim = await this.scrimRepository.findOne({
            where: {
                players: { id: playerId },
                state: In([ScrimState.PENDING, ScrimState.POPPED, ScrimState.IN_PROGRESS]),
            },
        });

        if (activeScrim) {
            throw new RpcException('Player is already in an active scrim');
        }

        // Create new queue entry
        const queueEntry = this.scrimQueueRepository.create({
            id: this.guidService.getId(),
            player: { id: playerId } as any,
            game: { id: gameId } as any,
            skillRating,
            queuedAt: new Date(),
            status: QueueStatus.QUEUED,
        });

        await this.scrimQueueRepository.save(queueEntry);

        this.logger.log(`Player ${playerId} joined queue for game ${gameId} with skill rating ${skillRating}`);

        // Record metrics
        this.observabilityService.incrementCounter('queue.join', 1, {
            gameId,
            skillRating: skillRating.toString(),
        });

        // Trigger matchmaking immediately
        this.processMatchmaking().catch(error => {
            this.logger.error('Error during matchmaking processing', error);
            this.observabilityService.incrementCounter('queue.matchmaking.error', 1, {
                error: error.message,
            });
        });

        return queueEntry;
    }

    /**
     * Remove a player from the matchmaking queue
     */
    async leaveQueue(payload: LeaveQueuePayload): Promise<boolean> {
        const { playerId } = payload;

        const queueEntry = await this.scrimQueueRepository.findOne({
            where: {
                player: { id: playerId },
                status: QueueStatus.QUEUED,
            },
        });

        if (!queueEntry) {
            throw new RpcException('Player is not in queue');
        }

        queueEntry.status = QueueStatus.CANCELLED;
        await this.scrimQueueRepository.save(queueEntry);

        this.logger.log(`Player ${playerId} left queue`);

        // Record metrics
        this.observabilityService.incrementCounter('queue.leave', 1, {
            gameId: queueEntry.game.id,
        });

        return true;
    }

    /**
     * Get queue status for a player
     */
    async getQueueStatus(payload: QueueStatusPayload): Promise<ScrimQueueEntity | null> {
        const { playerId } = payload;

        return await this.scrimQueueRepository.findOne({
            where: {
                player: { id: playerId },
                status: QueueStatus.QUEUED,
            },
            relations: ['player', 'game'],
        });
    }

    /**
     * Get all queued players for a specific game
     */
    async getQueuedPlayers(gameId: string): Promise<ScrimQueueEntity[]> {
        return await this.scrimQueueRepository.find({
            where: {
                game: { id: gameId },
                status: QueueStatus.QUEUED,
            },
            relations: ['player', 'game'],
            order: { queuedAt: 'ASC' },
        });
    }

    /**
     * Get queue position for a player
     */
    async getQueuePosition(playerId: string): Promise<number> {
        const queueEntry = await this.scrimQueueRepository.findOne({
            where: {
                player: { id: playerId },
                status: QueueStatus.QUEUED,
            },
            relations: ['game'],
        });

        if (!queueEntry) {
            return -1;
        }

        const queuedPlayers = await this.getQueuedPlayers(queueEntry.game.id);
        return queuedPlayers.findIndex(p => p.player.id === playerId) + 1;
    }

    /**
     * Process matchmaking algorithm to find suitable matches
     */
    async processMatchmaking(): Promise<MatchmakingResult[]> {
        const results: MatchmakingResult[] = [];

        try {
            // Get all games with queued players
            const games = await this.gameRepository.find();

            for (const game of games) {
                const queuedPlayers = await this.getQueuedPlayers(game.id);

                if (queuedPlayers.length < 2) {
                    continue; // Need at least 2 players for a match
                }

                // Group players by skill rating proximity
                const matches = await this.findSkillBasedMatches(queuedPlayers, game.id);

                for (const match of matches) {
                    try {
                        const scrim = await this.createScrimFromMatch(match, game.id);
                        if (scrim) {
                            results.push({
                                scrimId: scrim.id,
                                players: match.players.map(p => p.player.id),
                                gameId: game.id,
                                skillRating: match.averageSkillRating,
                            });
                        }
                    } catch (error) {
                        this.logger.error('Error creating scrim from match', error);
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error during matchmaking processing', error);
        }

        return results;
    }

    /**
     * Find skill-based matches from queued players
     */
    private async findSkillBasedMatches(
        queuedPlayers: ScrimQueueEntity[],
        gameId: string,
    ): Promise<Array<{ players: ScrimQueueEntity[]; averageSkillRating: number }>> {
        const matches: Array<{ players: ScrimQueueEntity[]; averageSkillRating: number }> = [];
        const usedPlayers = new Set<string>();

        // Sort players by skill rating
        const sortedPlayers = [...queuedPlayers].sort((a, b) => a.skillRating - b.skillRating);

        let skillRange = this.SKILL_RANGE_INITIAL;

        while (skillRange <= this.SKILL_RANGE_MAX && sortedPlayers.length - usedPlayers.size >= 2) {
            for (let i = 0; i < sortedPlayers.length; i++) {
                const player = sortedPlayers[i];

                if (usedPlayers.has(player.id)) {
                    continue;
                }

                // Find players within skill range
                const potentialTeammates = sortedPlayers.filter(p =>
                    !usedPlayers.has(p.id) &&
                    p.id !== player.id &&
                    Math.abs(p.skillRating - player.skillRating) <= skillRange
                );

                if (potentialTeammates.length >= 1) {
                    // Create a match with 2 players (can be extended for more)
                    const teammate = potentialTeammates[0];
                    const matchPlayers = [player, teammate];

                    // Calculate average skill rating
                    const averageSkillRating = matchPlayers.reduce((sum, p) => sum + p.skillRating, 0) / matchPlayers.length;

                    matches.push({
                        players: matchPlayers,
                        averageSkillRating,
                    });

                    // Mark players as used
                    usedPlayers.add(player.id);
                    usedPlayers.add(teammate.id);
                }
            }

            // Increase skill range for next iteration
            skillRange += this.SKILL_RANGE_INCREMENT;
        }

        return matches;
    }

    /**
     * Create a scrim from matched players
     */
    private async createScrimFromMatch(
        match: { players: ScrimQueueEntity[]; averageSkillRating: number },
        gameId: string,
    ): Promise<ScrimEntity | null> {
        try {
            // Get game and skill group information
            const game = await this.gameRepository.findOne({
                where: { id: gameId },
                relations: ['gameModes', 'skillGroups'],
            });
            if (!game) {
                throw new Error(`Game not found: ${gameId}`);
            }

            // Get the first player's skill group (assuming all players in same skill group)
            const firstPlayer = await this.playerRepository.findOne({
                where: { id: match.players[0].player.id },
                relations: ['skillGroup'],
            });

            if (!firstPlayer || !firstPlayer.skillGroup) {
                throw new Error('Player skill group not found');
            }

            // Get first available game mode for this game
            const gameMode = game.gameModes?.[0];
            if (!gameMode) {
                throw new Error(`No game modes found for game: ${gameId}`);
            }

            // Create scrim payload
            const createScrimPayload = {
                authorId: match.players[0].player.id,
                gameId: gameId,
                gameModeId: gameMode.id,
                skillGroupId: firstPlayer.skillGroup.id,
                maxParticipants: match.players.length,
                options: {
                    pendingTimeout: 5 * 60 * 1000, // 5 minutes
                },
            };

            // Create scrim using existing scrim service
            const scrim = await this.scrimCrudService.createScrim(createScrimPayload);

            // Add remaining players to scrim
            for (let i = 1; i < match.players.length; i++) {
                await this.scrimCrudService.addUserToScrim(scrim.id, match.players[i].player.id);
            }

            // Update queue entries to MATCHED status
            for (const queueEntry of match.players) {
                queueEntry.status = QueueStatus.MATCHED;
                queueEntry.matchedAt = new Date();
                await this.scrimQueueRepository.save(queueEntry);
            }

            // Publish scrim updated event
            await this.eventService.publish(MatchmakingEvents.ScrimUpdated, scrim);

            this.logger.log(`Created scrim ${scrim.id} for ${match.players.length} players`);

            return await this.scrimRepository.findOne({
                where: { id: scrim.id },
                relations: ['players', 'game', 'gameMode', 'skillGroup'],
            });
        } catch (error) {
            this.logger.error('Error creating scrim from match', error);
            return null;
        }
    }

    /**
     * Clean up expired queue entries
     */
    async cleanupExpiredQueues(): Promise<number> {
        const expirationTime = new Date(Date.now() - this.QUEUE_TIMEOUT_MS);

        const expiredEntries = await this.scrimQueueRepository.find({
            where: {
                status: QueueStatus.QUEUED,
                queuedAt: LessThan(expirationTime),
            },
        });

        for (const entry of expiredEntries) {
            entry.status = QueueStatus.EXPIRED;
            await this.scrimQueueRepository.save(entry);
        }

        this.logger.log(`Cleaned up ${expiredEntries.length} expired queue entries`);
        return expiredEntries.length;
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(gameId?: string): Promise<{
        totalQueued: number;
        averageWaitTime: number;
        gameStats: Array<{ gameId: string; queuedCount: number }>;
    }> {
        const whereConditions: any = { status: QueueStatus.QUEUED };
        if (gameId) {
            whereConditions.game = { id: gameId };
        }

        const queuedEntries = await this.scrimQueueRepository.find({
            where: whereConditions,
            relations: ['game'],
        });

        const totalQueued = queuedEntries.length;
        const now = new Date();

        // Calculate average wait time
        const totalWaitTime = queuedEntries.reduce((sum, entry) => {
            return sum + (now.getTime() - entry.queuedAt.getTime());
        }, 0);

        const averageWaitTime = totalQueued > 0 ? totalWaitTime / totalQueued : 0;

        // Group by game
        const gameStats = queuedEntries.reduce((stats, entry) => {
            const gameId = entry.game.id;
            if (!stats[gameId]) {
                stats[gameId] = 0;
            }
            stats[gameId]++;
            return stats;
        }, {} as Record<string, number>);

        const gameStatsArray = Object.entries(gameStats).map(([gameId, queuedCount]) => ({
            gameId,
            queuedCount,
        }));

        return {
            totalQueued,
            averageWaitTime,
            gameStats: gameStatsArray,
        };
    }
}