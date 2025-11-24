/**
 * Test utilities and mock factories for queue management system
 * Provides reusable test data builders and mock implementations
 */

import { ScrimQueueEntity, QueueStatus } from '../../../db/scrim_queue/scrim_queue.entity';
import { ScrimEntity, ScrimState } from '../../../db/scrim/scrim.entity';
import { GameEntity } from '../../../db/game/game.entity';
import { PlayerEntity } from '../../../db/player/player.entity';
import { GameModeEntity } from '../../../db/game_mode/game_mode.entity';
import { SkillGroupEntity } from '../../../db/skill_group/skill_group.entity';
import { UserEntity } from '../../../db/user/user.entity';
import { vi, expect } from 'vitest';

// Test data builders
export class TestDataBuilder {
    static createPlayer(overrides?: Partial<PlayerEntity>): PlayerEntity {
        const player = new PlayerEntity();
        player.id = overrides?.id || `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        player.user = overrides?.user || this.createUser({ username: `Test Player ${player.id}` });
        player.game = overrides?.game || this.createGame();
        player.skillGroup = overrides?.skillGroup || this.createSkillGroup();
        player.salary = overrides?.salary || '50000';
        player.createdAt = overrides?.createdAt || new Date();
        player.updateAt = overrides?.updateAt || new Date();
        return player;
    }

    static createUser(overrides?: Partial<UserEntity>): UserEntity {
        const user = new UserEntity();
        user.id = overrides?.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        user.username = overrides?.username || `Test User ${user.id}`;
        user.avatarUrl = overrides?.avatarUrl || `https://example.com/avatar-${user.id}.png`;
        user.active = overrides?.active ?? true;
        user.accounts = overrides?.accounts || [];
        user.players = overrides?.players || [];
        user.createdAt = overrides?.createdAt || new Date();
        user.updateAt = overrides?.updateAt || new Date();
        return user;
    }

    static createGame(overrides?: Partial<GameEntity>): GameEntity {
        const game = new GameEntity();
        game.id = overrides?.id || `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        game.name = overrides?.name || `Test Game ${game.id}`;
        game.createdAt = overrides?.createdAt || new Date();
        game.updateAt = overrides?.updateAt || new Date();
        game.gameModes = overrides?.gameModes || [];
        game.skillGroups = overrides?.skillGroups || [];
        return game;
    }

    static createGameMode(overrides?: Partial<GameModeEntity>): GameModeEntity {
        const gameMode = new GameModeEntity();
        gameMode.id = overrides?.id || `game-mode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        gameMode.name = overrides?.name || `Test Game Mode ${gameMode.id}`;
        gameMode.createdAt = overrides?.createdAt || new Date();
        gameMode.updateAt = overrides?.updateAt || new Date();
        return gameMode;
    }

    static createSkillGroup(overrides?: Partial<SkillGroupEntity>): SkillGroupEntity {
        const skillGroup = new SkillGroupEntity();
        skillGroup.id = overrides?.id || `skill-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        skillGroup.name = overrides?.name || `Test Skill Group ${skillGroup.id}`;
        skillGroup.createdAt = overrides?.createdAt || new Date();
        skillGroup.updateAt = overrides?.updateAt || new Date();
        return skillGroup;
    }

    static createScrim(overrides?: Partial<ScrimEntity>): ScrimEntity {
        const scrim = new ScrimEntity();
        scrim.id = overrides?.id || `scrim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        scrim.state = overrides?.state || ScrimState.PENDING;
        scrim.authorId = overrides?.authorId || `author-${Date.now()}`;
        scrim.maxPlayers = overrides?.maxPlayers || 4;
        scrim.createdAt = overrides?.createdAt || new Date();
        scrim.settings = overrides?.settings || {};
        scrim.players = overrides?.players || [];
        scrim.game = overrides?.game || this.createGame();
        scrim.gameMode = overrides?.gameMode || this.createGameMode();
        scrim.skillGroup = overrides?.skillGroup || this.createSkillGroup();
        return scrim;
    }

    static createQueueEntry(overrides?: Partial<ScrimQueueEntity>): ScrimQueueEntity {
        const queueEntry = new ScrimQueueEntity();
        queueEntry.id = overrides?.id || `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        queueEntry.player = overrides?.player || this.createPlayer();
        queueEntry.game = overrides?.game || this.createGame();
        queueEntry.skillRating = overrides?.skillRating || 1500;
        queueEntry.queuedAt = overrides?.queuedAt || new Date();
        queueEntry.status = overrides?.status || QueueStatus.QUEUED;
        queueEntry.matchedAt = overrides?.matchedAt || null;
        queueEntry.match = overrides?.match || null;
        return queueEntry;
    }

    static createQueueEntries(count: number, game: GameEntity, baseSkillRating: number = 1500): ScrimQueueEntity[] {
        const entries: ScrimQueueEntity[] = [];
        for (let i = 0; i < count; i++) {
            const player = this.createPlayer({ user: this.createUser({ username: `Player ${i}` }) });
            const entry = this.createQueueEntry({
                player,
                game,
                skillRating: baseSkillRating + (i * 25), // Increment skill rating
                queuedAt: new Date(Date.now() - (count - i) * 1000), // Stagger queue times
            });
            entries.push(entry);
        }
        return entries;
    }

    static createPlayersWithSkillRange(count: number, minSkill: number, maxSkill: number): PlayerEntity[] {
        const players: PlayerEntity[] = [];
        const skillRange = maxSkill - minSkill;

        for (let i = 0; i < count; i++) {
            const skillRating = minSkill + (skillRange * i) / (count - 1);
            const player = this.createPlayer({
                user: this.createUser({ username: `Player ${i} (Skill: ${Math.round(skillRating)})` }),
            });
            players.push(player);
        }
        return players;
    }
}

// Mock repository factories
export class MockRepositoryFactory {
    static createScrimQueueRepository() {
        return {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            createQueryBuilder: vi.fn(),
            clear: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
            insert: vi.fn(),
            count: vi.fn(),
        };
    }

    static createPlayerRepository() {
        return {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            createQueryBuilder: vi.fn(),
            clear: vi.fn(),
            delete: vi.fn(),
        };
    }

    static createGameRepository() {
        return {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            createQueryBuilder: vi.fn(),
            clear: vi.fn(),
            delete: vi.fn(),
        };
    }

    static createScrimRepository() {
        return {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            createQueryBuilder: vi.fn(),
            clear: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
        };
    }

    static createScrimCrudService() {
        return {
            createScrim: vi.fn(),
            addUserToScrim: vi.fn(),
            getScrim: vi.fn(),
            getAllScrims: vi.fn(),
            updateScrimState: vi.fn(),
            removeUserFromScrim: vi.fn(),
            destroyScrim: vi.fn(),
        };
    }

    static createEventsService() {
        return {
            publish: vi.fn(),
            subscribe: vi.fn(),
            unsubscribe: vi.fn(),
            emit: vi.fn(),
        };
    }

    static createGuidService() {
        return {
            getId: vi.fn().mockReturnValue(`test-id-${Date.now()}`),
        };
    }

    static createObservabilityService() {
        return {
            incrementCounter: vi.fn(),
            recordHistogram: vi.fn(),
            recordGauge: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        };
    }
}

// Test scenario builders
export class TestScenarioBuilder {
    static async createBasicQueueScenario(queueService: any, playerRepository: any, gameRepository: any) {
        const game = TestDataBuilder.createGame({ name: 'Test Game' });
        const player1 = TestDataBuilder.createPlayer({ user: TestDataBuilder.createUser({ username: 'Player 1' }) });
        const player2 = TestDataBuilder.createPlayer({ user: TestDataBuilder.createUser({ username: 'Player 2' }) });

        await gameRepository.save(game);
        await playerRepository.save([player1, player2]);

        return { game, players: [player1, player2] };
    }

    static async createMultiGameScenario(queueService: any, playerRepository: any, gameRepository: any, gameCount: number = 3) {
        const games = [];
        const players = [];

        for (let i = 0; i < gameCount; i++) {
            const game = TestDataBuilder.createGame({ name: `Game ${i}` });
            games.push(game);
        }

        for (let i = 0; i < gameCount * 2; i++) {
            const player = TestDataBuilder.createPlayer({ user: TestDataBuilder.createUser({ username: `Player ${i}` }) });
            players.push(player);
        }

        await gameRepository.save(games);
        await playerRepository.save(players);

        return { games, players };
    }

    static async createSkillBasedScenario(queueService: any, playerRepository: any, gameRepository: any, playerCount: number = 10) {
        const game = TestDataBuilder.createGame({ name: 'Skill Test Game' });
        const players = TestDataBuilder.createPlayersWithSkillRange(playerCount, 1000, 2000);

        await gameRepository.save(game);
        await playerRepository.save(players);

        return { game, players };
    }

    static async createExpiredQueueScenario(queueService: any, playerRepository: any, gameRepository: any, scrimQueueRepository: any, expiredCount: number = 5) {
        const game = TestDataBuilder.createGame({ name: 'Expired Queue Test Game' });
        await gameRepository.save(game);

        const expiredEntries = [];
        for (let i = 0; i < expiredCount; i++) {
            const player = TestDataBuilder.createPlayer({ user: TestDataBuilder.createUser({ username: `Expired Player ${i}` }) });
            await playerRepository.save(player);

            const expiredEntry = TestDataBuilder.createQueueEntry({
                player,
                game,
                skillRating: 1500 + i,
                queuedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                status: QueueStatus.QUEUED,
            });

            await scrimQueueRepository.save(expiredEntry);
            expiredEntries.push(expiredEntry);
        }

        return { game, expiredEntries };
    }
}

// Performance testing utilities
export class PerformanceTestUtils {
    static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
        const startTime = Date.now();
        const result = await fn();
        const endTime = Date.now();
        return { result, duration: endTime - startTime };
    }

    static async measureMemoryUsage<T>(fn: () => Promise<T>): Promise<{ result: T; memoryUsage: NodeJS.MemoryUsage }> {
        const initialMemory = process.memoryUsage();
        const result = await fn();
        const finalMemory = process.memoryUsage();

        return {
            result,
            memoryUsage: {
                rss: finalMemory.rss - initialMemory.rss,
                heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
                heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
                external: finalMemory.external - initialMemory.external,
                arrayBuffers: finalMemory.arrayBuffers - initialMemory.arrayBuffers,
            }
        };
    }

    static generateLoadTestData(playerCount: number, gameCount: number = 1) {
        const games = [];
        const players = [];
        const queueEntries = [];

        for (let i = 0; i < gameCount; i++) {
            games.push(TestDataBuilder.createGame({ name: `Load Test Game ${i}` }));
        }

        for (let i = 0; i < playerCount; i++) {
            const player = TestDataBuilder.createPlayer({ user: TestDataBuilder.createUser({ username: `Load Test Player ${i}` }) });
            players.push(player);

            // Distribute players across games
            const gameIndex = i % gameCount;
            const queueEntry = TestDataBuilder.createQueueEntry({
                player,
                game: games[gameIndex],
                skillRating: 1500 + (Math.random() * 500), // Random skill between 1500-2000
            });
            queueEntries.push(queueEntry);
        }

        return { games, players, queueEntries };
    }

    static createConcurrentOperations<T>(operation: (index: number) => Promise<T>, count: number): Promise<T[]> {
        const promises = Array(count).fill(null).map((_, index) => operation(index));
        return Promise.all(promises);
    }
}

// Database testing utilities
export class DatabaseTestUtils {
    static async cleanDatabase(dataSource: any, entities: any[]) {
        for (const entity of entities) {
            await dataSource.getRepository(entity).clear();
        }
    }

    static async seedDatabase(dataSource: any, seedData: Record<string, any[]>) {
        for (const [entityName, data] of Object.entries(seedData)) {
            const repository = dataSource.getRepository(entityName);
            await repository.save(data);
        }
    }

    static async verifyDatabaseState(dataSource: any, expectations: Record<string, any>) {
        const results = {};
        for (const [entityName, expectedCount] of Object.entries(expectations)) {
            const repository = dataSource.getRepository(entityName);
            const count = await repository.count();
            results[entityName] = count;

            if (typeof expectedCount === 'number') {
                expect(count).toBe(expectedCount);
            } else if (typeof expectedCount === 'object' && expectedCount.query) {
                const actualCount = await repository.count(expectedCount.query);
                expect(actualCount).toBe(expectedCount.expected);
            }
        }
        return results;
    }

    static createMockDataSource() {
        return {
            getRepository: vi.fn(),
            createQueryRunner: vi.fn(),
            manager: {
                save: vi.fn(),
                find: vi.fn(),
                findOne: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
            },
            destroy: vi.fn(),
        };
    }
}

// Assertion helpers
export class QueueTestAssertions {
    static assertQueueEntryValid(queueEntry: ScrimQueueEntity) {
        expect(queueEntry).toBeDefined();
        expect(queueEntry.id).toBeDefined();
        expect(queueEntry.player).toBeDefined();
        expect(queueEntry.game).toBeDefined();
        expect(queueEntry.skillRating).toBeGreaterThanOrEqual(0);
        expect(queueEntry.queuedAt).toBeInstanceOf(Date);
        expect(Object.values(QueueStatus)).toContain(queueEntry.status);
    }

    static assertMatchResultValid(matchResult: any) {
        expect(matchResult).toBeDefined();
        expect(matchResult.scrimId).toBeDefined();
        expect(matchResult.players).toBeInstanceOf(Array);
        expect(matchResult.players.length).toBeGreaterThanOrEqual(2);
        expect(matchResult.gameId).toBeDefined();
        expect(matchResult.skillRating).toBeGreaterThan(0);
    }

    static assertQueueStatsValid(stats: any) {
        expect(stats).toBeDefined();
        expect(stats.totalQueued).toBeGreaterThanOrEqual(0);
        expect(stats.averageWaitTime).toBeGreaterThanOrEqual(0);
        expect(stats.gameStats).toBeInstanceOf(Array);

        stats.gameStats.forEach(gameStat => {
            expect(gameStat.gameId).toBeDefined();
            expect(gameStat.queuedCount).toBeGreaterThan(0);
        });
    }

    static assertSkillBasedMatch(matchPlayers: ScrimQueueEntity[], maxSkillDifference: number = 500) {
        expect(matchPlayers.length).toBeGreaterThanOrEqual(2);

        const skillRatings = matchPlayers.map(p => p.skillRating);
        const minSkill = Math.min(...skillRatings);
        const maxSkill = Math.max(...skillRatings);
        const skillDifference = maxSkill - minSkill;

        expect(skillDifference).toBeLessThanOrEqual(maxSkillDifference);
    }
}

// Integration test helpers
export class IntegrationTestHelpers {
    static async setupTestEnvironment() {
        // This would be implemented based on your specific test environment setup
        // For now, return a basic structure
        return {
            dataSource: null,
            repositories: {},
            services: {},
        };
    }

    static async teardownTestEnvironment(environment: any) {
        if (environment.dataSource) {
            await environment.dataSource.destroy();
        }
    }

    static createTestLogger() {
        return {
            log: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
        };
    }

    static async waitForCondition(condition: () => Promise<boolean> | boolean, timeout: number = 5000, interval: number = 100): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        return false;
    }
}