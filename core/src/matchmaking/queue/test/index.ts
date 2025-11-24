/**
 * Test index for queue management system
 * Exports all test utilities and test suites
 */

import { expect } from 'vitest';

// Test utilities and factories
export * from './test-utils';

// Unit tests
export * from '../queue.service.spec';
export * from '../queue.worker.spec';

// Integration tests
export * from '../queue.integration.test';

// Performance tests
export * from '../queue.performance.test';

// Test configuration and setup
export const QUEUE_TEST_CONFIG = {
    // Database configuration for tests
    database: {
        type: 'postgres' as const,
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
        username: process.env.TEST_DB_USERNAME || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        database: process.env.TEST_DB_NAME || 'sprocket_test',
        synchronize: true,
        dropSchema: true,
        logging: false,
    },

    // Test timeouts
    timeouts: {
        unit: 10000,      // 10 seconds for unit tests
        integration: 30000, // 30 seconds for integration tests
        performance: 60000, // 60 seconds for performance tests
    },

    // Performance thresholds
    performance: {
        maxMatchmakingTime: 10000,     // 10 seconds max for matchmaking
        maxQueueStatsTime: 1000,       // 1 second max for stats calculation
        maxCleanupTime: 5000,          // 5 seconds max for cleanup
        maxMemoryIncrease: 100 * 1024 * 1024, // 100MB max memory increase
        maxConcurrentOperations: 100,  // Max concurrent operations to test
    },

    // Test data sizes
    testData: {
        small: 10,
        medium: 100,
        large: 1000,
        extreme: 10000,
    },

    // Skill rating ranges for testing
    skillRanges: {
        min: 0,
        max: 5000,
        typical: { min: 1000, max: 3000 },
        extreme: { min: -1000, max: 6000 },
    },
};

// Test suite organization
export const QUEUE_TEST_SUITES = {
    unit: [
        'QueueService Unit Tests',
        'QueueWorker Unit Tests',
    ],
    integration: [
        'QueueService Integration Tests',
    ],
    performance: [
        'QueueService Performance Tests',
    ],
    endToEnd: [
        'Complete Queue Workflow Tests',
    ],
};

// Test data generators
export const createTestScenarios = {
    // Basic queue scenario
    basicQueue: (playerCount: number = 2) => ({
        name: `Basic Queue - ${playerCount} players`,
        players: playerCount,
        games: 1,
        expectedMatches: Math.floor(playerCount / 2),
    }),

    // Multi-game scenario
    multiGame: (gameCount: number = 3, playersPerGame: number = 10) => ({
        name: `Multi Game - ${gameCount} games, ${playersPerGame} players each`,
        games: gameCount,
        players: gameCount * playersPerGame,
        expectedMatches: gameCount * Math.floor(playersPerGame / 2),
    }),

    // Skill-based scenario
    skillBased: (playerCount: number = 20, skillRange: number = 500) => ({
        name: `Skill Based - ${playerCount} players, ${skillRange} skill range`,
        players: playerCount,
        skillRange,
        expectedMatches: Math.floor(playerCount / 2),
    }),

    // High concurrency scenario
    highConcurrency: (concurrentOps: number = 100) => ({
        name: `High Concurrency - ${concurrentOps} concurrent operations`,
        concurrentOperations: concurrentOps,
        expectedSuccessRate: 0.95, // 95% success rate
    }),

    // Large dataset scenario
    largeDataset: (playerCount: number = 1000) => ({
        name: `Large Dataset - ${playerCount} players`,
        players: playerCount,
        expectedMatches: Math.floor(playerCount / 2),
        maxProcessingTime: 10000, // 10 seconds
    }),

    // Expired queue scenario
    expiredQueue: (expiredCount: number = 50, activeCount: number = 10) => ({
        name: `Expired Queue - ${expiredCount} expired, ${activeCount} active`,
        expiredEntries: expiredCount,
        activeEntries: activeCount,
        expectedCleaned: expiredCount,
    }),
};

// PostgreSQL specific test configurations
export const POSTGRESQL_TEST_CONFIG = {
    // Connection pool settings for tests
    pool: {
        min: 1,
        max: 5,
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 2000,
    },

    // Transaction settings
    transactions: {
        isolationLevel: 'READ_COMMITTED',
        timeout: 5000, // 5 seconds
    },

    // Index and performance testing
    indexes: {
        testIndexUsage: true,
        testQueryPlans: true,
        testLockContention: true,
    },

    // Data consistency tests
    consistency: {
        testForeignKeys: true,
        testUniqueConstraints: true,
        testCheckConstraints: true,
    },
};

// Test execution helpers
export const TestExecutionHelpers = {
    // Run test with timeout
    async runWithTimeout<T>(testFn: () => Promise<T>, timeout: number, description: string): Promise<T> {
        return Promise.race([
            testFn(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Test "${description}" timed out after ${timeout}ms`)), timeout)
            ),
        ]);
    },

    // Retry test on failure
    async retryTest<T>(testFn: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await testFn();
            } catch (error) {
                lastError = error as Error;
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError!;
    },

    // Measure and assert performance
    async measurePerformance(
        testFn: () => Promise<void>,
        thresholds: { maxDuration: number; maxMemoryIncrease?: number }
    ): Promise<{ duration: number; memoryIncrease: number }> {
        const initialMemory = process.memoryUsage();
        const startTime = Date.now();

        await testFn();

        const endTime = Date.now();
        const finalMemory = process.memoryUsage();

        const duration = endTime - startTime;
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

        // Assert thresholds
        expect(duration).toBeLessThanOrEqual(thresholds.maxDuration);
        if (thresholds.maxMemoryIncrease) {
            expect(memoryIncrease).toBeLessThanOrEqual(thresholds.maxMemoryIncrease);
        }

        return { duration, memoryIncrease };
    },
};

// Export all test configurations as default
export default {
    QUEUE_TEST_CONFIG,
    QUEUE_TEST_SUITES,
    createTestScenarios,
    POSTGRESQL_TEST_CONFIG,
    TestExecutionHelpers,
};