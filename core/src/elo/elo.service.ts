import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
    EloRatingNodeEntity,
    GameRatingConfigEntity,
    MatchRatingCalculationEntity,
    MatchEntity,
    RatingSystem,
    RatingNodeType,
    LogsRepository,
    MetricsRepository,
    LogLevel,
    MetricType,
} from '../db/internal';
import { EloCalculation } from './calculation/elo.calculation';
import { GlickoCalculation } from './calculation/glicko.calculation';
import { CalculationStrategy } from './calculation/calculation-strategy.interface';

@Injectable()
export class EloService {
    private readonly logger = new Logger(EloService.name);
    private strategies: Map<RatingSystem, CalculationStrategy>;

    constructor(
        @InjectRepository(EloRatingNodeEntity)
        private readonly ratingNodeRepo: Repository<EloRatingNodeEntity>,
        @InjectRepository(GameRatingConfigEntity)
        private readonly configRepo: Repository<GameRatingConfigEntity>,
        @InjectRepository(MatchRatingCalculationEntity)
        private readonly calculationRepo: Repository<MatchRatingCalculationEntity>,
        private readonly dataSource: DataSource,
        private readonly logsRepo: LogsRepository,
        private readonly metricsRepo: MetricsRepository,
    ) {
        this.strategies = new Map();
        this.strategies.set(RatingSystem.ELO, new EloCalculation());
        this.strategies.set(RatingSystem.GLICKO, new GlickoCalculation());
        // TrueSkill to be added
    }

    async processMatch(matchId: string): Promise<void> {
        const startTime = Date.now();
        const traceId = `elo-${matchId}-${Date.now()}`;

        // Log start of processing
        await this.logsRepo.save(this.logsRepo.create({
            level: LogLevel.INFO,
            message: `Starting Elo calculation for match`,
            service: 'elo-service',
            context: 'EloService',
            tags: { matchId, operation: 'process_match_start' },
            traceId,
        }));

        return this.dataSource.transaction(async (manager) => {
            try {
                const match = await manager.findOne(MatchEntity, {
                    where: { id: matchId },
                    relations: [
                        'game',
                        'rounds',
                        'rounds.playerStats',
                        'rounds.playerStats.player',
                        'rounds.teamStats',
                        'rounds.teamStats.team',
                    ],
                });

                if (!match) {
                    this.logger.error(`Match ${matchId} not found`);
                    await this.logsRepo.save(this.logsRepo.create({
                        level: LogLevel.ERROR,
                        message: `Match not found`,
                        service: 'elo-service',
                        context: 'EloService',
                        tags: { matchId, operation: 'match_not_found' },
                        traceId,
                    }));
                    return;
                }

                const config = await manager.findOne(GameRatingConfigEntity, {
                    where: { game: { id: match.game.id }, isActive: true },
                    order: { effectiveFrom: 'DESC' },
                });

                if (!config) {
                    this.logger.warn(`No active rating config for game ${match.game.id}`);
                    await this.logsRepo.save(this.logsRepo.create({
                        level: LogLevel.WARN,
                        message: `No active rating config for game`,
                        service: 'elo-service',
                        context: 'EloService',
                        tags: { matchId, gameId: match.game.id, operation: 'no_config' },
                        traceId,
                    }));
                    return;
                }

                const strategy = this.strategies.get(config.system);
                if (!strategy) {
                    this.logger.error(`No strategy found for system ${config.system}`);
                    await this.logsRepo.save(this.logsRepo.create({
                        level: LogLevel.ERROR,
                        message: `No strategy found for rating system`,
                        service: 'elo-service',
                        context: 'EloService',
                        tags: { matchId, system: config.system, operation: 'no_strategy' },
                        traceId,
                    }));
                    return;
                }

                // Extract unique players from all rounds
                const playerSet = new Set<string>();
                for (const round of match.rounds || []) {
                    for (const playerStat of round.playerStats || []) {
                        if (playerStat.player?.id) {
                            playerSet.add(playerStat.player.id);
                        }
                    }
                }

                const players = Array.from(playerSet).map(id => ({ id }));

                await this.logsRepo.save(this.logsRepo.create({
                    level: LogLevel.DEBUG,
                    message: `Extracted players from match`,
                    service: 'elo-service',
                    context: 'EloService',
                    tags: {
                        matchId,
                        playerCount: players.length,
                        roundCount: match.rounds?.length || 0,
                        operation: 'players_extracted',
                    },
                    traceId,
                }));

                // Fetch input ratings (latest node for each player)
                const inputRatings: EloRatingNodeEntity[] = [];
                const newPlayerCount = { value: 0 };
                
                for (const player of players) {
                    const latestNode = await manager.findOne(EloRatingNodeEntity, {
                        where: { player: { id: player.id }, game: { id: match.game.id } },
                        order: { createdAt: 'DESC' },
                        relations: ['player', 'game'],
                    });
                    
                    if (latestNode) {
                        inputRatings.push(latestNode);
                    } else {
                        // Create initial rating node if none exists
                        newPlayerCount.value++;
                        const initial = manager.create(EloRatingNodeEntity, {
                            player: { id: player.id },
                            game: match.game,
                            rating: config.parameters.initialRating || 1000,
                            uncertainty: config.parameters.ratingDeviation || 350,
                            nodeType: RatingNodeType.INITIAL,
                        });
                        const saved = await manager.save(initial);
                        // Reload with relations
                        const reloaded = await manager.findOne(EloRatingNodeEntity, {
                            where: { id: saved.id },
                            relations: ['player', 'game'],
                        });
                        if (reloaded) {
                            inputRatings.push(reloaded);
                        }
                    }
                }

                if (inputRatings.length === 0) {
                    this.logger.warn(`No players found for match ${matchId}`);
                    await this.logsRepo.save(this.logsRepo.create({
                        level: LogLevel.WARN,
                        message: `No players found for match`,
                        service: 'elo-service',
                        context: 'EloService',
                        tags: { matchId, operation: 'no_players' },
                        traceId,
                    }));
                    return;
                }

                // Track new players metric
                if (newPlayerCount.value > 0) {
                    await this.metricsRepo.save(this.metricsRepo.create({
                        name: 'elo.new_players',
                        value: newPlayerCount.value,
                        type: MetricType.COUNTER,
                        service: 'elo-service',
                        labels: { gameId: match.game.id },
                        traceId,
                    }));
                }

                const calcStartTime = Date.now();
                const results = strategy.calculate(match, inputRatings, config);
                const calcDuration = Date.now() - calcStartTime;

                // Track calculation duration
                await this.metricsRepo.save(this.metricsRepo.create({
                    name: 'elo.calculation.duration',
                    value: calcDuration,
                    type: MetricType.HISTOGRAM,
                    unit: 'ms',
                    service: 'elo-service',
                    labels: { 
                        gameId: match.game.id,
                        system: config.system,
                        playerCount: inputRatings.length.toString(),
                    },
                    traceId,
                }));

                // Save output ratings and collect stats
                const ratingChanges: Record<string, number> = {};
                let totalRatingChange = 0;
                let maxRatingChange = 0;
                let minRatingChange = 0;

                for (const [playerId, result] of Object.entries(results)) {
                    const inputNode = inputRatings.find(n => n.player.id === playerId);
                    if (!inputNode) continue;

                    const outputNode = manager.create(EloRatingNodeEntity, {
                        player: { id: playerId },
                        game: match.game,
                        rating: result.rating,
                        uncertainty: result.uncertainty,
                        sourceMatch: match,
                        nodeType: RatingNodeType.MATCH_OUTPUT,
                    });
                    await manager.save(outputNode);

                    const calculation = manager.create(MatchRatingCalculationEntity, {
                        match,
                        player: { id: playerId },
                        game: match.game,
                        inputRating: inputNode,
                        outputRating: outputNode,
                        ratingChange: result.rating - inputNode.rating,
                    });
                    await manager.save(calculation);

                    const change = result.rating - inputNode.rating;
                    ratingChanges[playerId] = change;
                    totalRatingChange += Math.abs(change);
                    maxRatingChange = Math.max(maxRatingChange, change);
                    minRatingChange = Math.min(minRatingChange, change);

                    // Track individual rating change
                    await this.metricsRepo.save(this.metricsRepo.create({
                        name: 'elo.rating.change',
                        value: change,
                        type: MetricType.HISTOGRAM,
                        unit: 'points',
                        service: 'elo-service',
                        labels: {
                            gameId: match.game.id,
                            playerId,
                            direction: change > 0 ? 'increase' : 'decrease',
                        },
                        traceId,
                    }));
                }

                const duration = Date.now() - startTime;

                // Log successful completion with stats
                await this.logsRepo.save(this.logsRepo.create({
                    level: LogLevel.INFO,
                    message: `Elo calculation completed successfully`,
                    service: 'elo-service',
                    context: 'EloService',
                    duration,
                    tags: {
                        matchId,
                        gameId: match.game.id,
                        system: config.system,
                        playersProcessed: inputRatings.length,
                        newPlayers: newPlayerCount.value,
                        avgRatingChange: (totalRatingChange / inputRatings.length).toFixed(2),
                        maxRatingChange: maxRatingChange.toFixed(2),
                        minRatingChange: minRatingChange.toFixed(2),
                        operation: 'process_match_complete',
                    },
                    traceId,
                }));

                // Track overall success metric
                await this.metricsRepo.save(this.metricsRepo.create({
                    name: 'elo.calculations.total',
                    value: 1,
                    type: MetricType.COUNTER,
                    service: 'elo-service',
                    labels: {
                        gameId: match.game.id,
                        system: config.system,
                        status: 'success',
                    },
                    traceId,
                }));

                this.logger.log(`Processed Elo ratings for match ${matchId}, ${inputRatings.length} players`);

            } catch (error) {
                const duration = Date.now() - startTime;
                
                // Log error
                await this.logsRepo.save(this.logsRepo.create({
                    level: LogLevel.ERROR,
                    message: `Elo calculation failed`,
                    service: 'elo-service',
                    context: 'EloService',
                    duration,
                    error: error.message,
                    trace: error.stack,
                    tags: { matchId, operation: 'process_match_error' },
                    traceId,
                }));

                // Track failure metric
                await this.metricsRepo.save(this.metricsRepo.create({
                    name: 'elo.calculations.total',
                    value: 1,
                    type: MetricType.COUNTER,
                    service: 'elo-service',
                    labels: {
                        status: 'error',
                        errorType: error.name || 'unknown',
                    },
                    traceId,
                }));

                throw error;
            }
        });
    }
}
