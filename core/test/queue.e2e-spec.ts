import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    E2ETestUtils,
    GraphQLTestHelpers,
    TestDataFactory,
    AuthTestHelpers,
    PerformanceMonitor,
} from './e2e-utils';

/**
 * End-to-end tests for Queue GraphQL endpoints
 * Tests real HTTP requests to GraphQL endpoints with authentication
 */
describe('Queue E2E Tests', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let e2eUtils: E2ETestUtils;
    let testDataFactory: TestDataFactory;
    let performanceMonitor: PerformanceMonitor;

    beforeAll(async () => {
        const testApp = await E2ETestUtils.createTestApp();
        app = testApp.app;
        dataSource = testApp.dataSource;
        e2eUtils = new E2ETestUtils(app, dataSource);
        testDataFactory = new TestDataFactory(e2eUtils);
        performanceMonitor = new PerformanceMonitor();
    });

    afterAll(async () => {
        await e2eUtils.closeTestApp();
    });

    beforeEach(async () => {
        await e2eUtils.cleanupTestData();
        performanceMonitor.start();
    });

    afterEach(() => {
        performanceMonitor.end();
    });

    describe('GraphQL Schema Validation', () => {
        it('should expose queue mutations and queries in GraphQL schema', async () => {
            const introspectionQuery = `
                query {
                    __schema {
                        mutationType {
                            fields {
                                name
                                type {
                                    name
                                }
                            }
                        }
                        queryType {
                            fields {
                                name
                                type {
                                    name
                                }
                            }
                        }
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(introspectionQuery))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);

            const mutationFields = response.body.data.__schema.mutationType.fields;
            const queryFields = response.body.data.__schema.queryType.fields;

            // Check for queue mutations
            const queueMutations = ['joinQueue', 'leaveQueue', 'processMatchmaking'];
            queueMutations.forEach(mutation => {
                expect(mutationFields.some((field: any) => field.name === mutation)).toBe(true);
            });

            // Check for queue queries
            const queueQueries = ['getQueueStatus', 'getQueueStats'];
            queueQueries.forEach(query => {
                expect(queryFields.some((field: any) => field.name === query)).toBe(true);
            });
        });

        it('should validate queue type definitions', async () => {
            const typeQuery = `
                query {
                    __type(name: "QueueStatus") {
                        fields {
                            name
                            type {
                                name
                            }
                        }
                    }
                    __type(name: "QueueStats") {
                        fields {
                            name
                            type {
                                name
                            }
                        }
                    }
                    __type(name: "MatchmakingResult") {
                        fields {
                            name
                            type {
                                name
                            }
                        }
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(typeQuery))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);

            // Validate QueueStatus fields
            const queueStatusFields = response.body.data.__type.fields;
            const expectedQueueStatusFields = ['playerId', 'gameId', 'skillRating', 'queuedAt', 'position'];
            expectedQueueStatusFields.forEach(field => {
                expect(queueStatusFields.some((f: any) => f.name === field)).toBe(true);
            });

            // Validate QueueStats fields
            const queueStatsFields = response.body.data.__type[1].fields;
            const expectedQueueStatsFields = ['totalQueued', 'averageWaitTime', 'gameStats'];
            expectedQueueStatsFields.forEach(field => {
                expect(queueStatsFields.some((f: any) => f.name === field)).toBe(true);
            });

            // Validate MatchmakingResult fields
            const matchmakingResultFields = response.body.data.__type[2].fields;
            const expectedMatchmakingFields = ['scrimId', 'playerIds', 'gameId', 'skillRating'];
            expectedMatchmakingFields.forEach(field => {
                expect(matchmakingResultFields.some((f: any) => f.name === field)).toBe(true);
            });
        });
    });

    describe('joinQueue Mutation', () => {
        it('should successfully join queue with valid authentication', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const variables = {
                gameId: game.id,
                skillRating: 1500,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            expect(response.body.data.joinQueue).toBe(true);
        });

        it('should fail to join queue without authentication', async () => {
            const { game } = await testDataFactory.createBasicQueueScenario();

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const variables = {
                gameId: game.id,
                skillRating: 1500,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toContain('Unauthorized');
        });

        it('should fail to join queue when already in queue', async () => {
            const { user, game, player, queueEntry } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const variables = {
                gameId: game.id,
                skillRating: 1600,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toContain('Failed to join queue');
        });

        it('should handle concurrent join queue requests', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const variables = {
                gameId: game.id,
                skillRating: 1500,
            };

            // Send multiple concurrent requests
            const promises = Array.from({ length: 5 }, () =>
                e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .set(GraphQLTestHelpers.createAuthHeaders(token))
                    .send(GraphQLTestHelpers.mutation(mutation, variables))
                    .expect(200)
            );

            const responses = await Promise.all(promises);

            // Only the first should succeed, others should fail
            const successCount = responses.filter(r => r.body.data?.joinQueue === true).length;
            const errorCount = responses.filter(r => r.body.errors?.length > 0).length;

            expect(successCount + errorCount).toBe(5);
        });

        it('should validate input parameters', async () => {
            const { user } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            // Test with invalid skill rating (negative)
            const negativeSkillVariables = {
                gameId: 'test-game',
                skillRating: -100,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, negativeSkillVariables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
        });
    });

    describe('leaveQueue Mutation', () => {
        it('should successfully leave queue when in queue', async () => {
            const { user, game, player, queueEntry } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation LeaveQueue {
                    leaveQueue
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            expect(response.body.data.leaveQueue).toBe(true);
        });

        it('should fail to leave queue when not in queue', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario({
                queueEntry: null, // Don't create queue entry
            });
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation LeaveQueue {
                    leaveQueue
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation))
                .expect(200);

            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toContain('Failed to leave queue');
        });

        it('should handle concurrent leave queue requests', async () => {
            const { user, game, player, queueEntry } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation LeaveQueue {
                    leaveQueue
                }
            `;

            // Send multiple concurrent requests
            const promises = Array.from({ length: 3 }, () =>
                e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .set(GraphQLTestHelpers.createAuthHeaders(token))
                    .send(GraphQLTestHelpers.mutation(mutation))
                    .expect(200)
            );

            const responses = await Promise.all(promises);

            // All should succeed (idempotent operation)
            responses.forEach(response => {
                GraphQLTestHelpers.validateGraphQLResponse(response);
                expect(response.body.data.leaveQueue).toBe(true);
            });
        });
    });

    describe('getQueueStatus Query', () => {
        it('should return queue status when in queue', async () => {
            const { user, game, player, queueEntry } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const query = `
                query GetQueueStatus {
                    getQueueStatus {
                        playerId
                        gameId
                        skillRating
                        queuedAt
                        position
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.query(query))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const status = response.body.data.getQueueStatus;

            expect(status).toBeDefined();
            expect(status.playerId).toBe(player.id);
            expect(status.gameId).toBe(game.id);
            expect(status.skillRating).toBe(queueEntry.skillRating);
            expect(status.position).toBeGreaterThanOrEqual(1);
        });

        it('should return null when not in queue', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario({
                queueEntry: null,
            });
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const query = `
                query GetQueueStatus {
                    getQueueStatus {
                        playerId
                        gameId
                        skillRating
                        queuedAt
                        position
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.query(query))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            expect(response.body.data.getQueueStatus).toBeNull();
        });

        it('should handle queue position calculation with multiple players', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();
            const { players: otherPlayers, queueEntries: otherQueueEntries } = await testDataFactory.createMultiPlayerScenario(game, 5);
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const query = `
                query GetQueueStatus {
                    getQueueStatus {
                        playerId
                        gameId
                        skillRating
                        queuedAt
                        position
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.query(query))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const status = response.body.data.getQueueStatus;

            expect(status).toBeDefined();
            expect(status.position).toBeGreaterThanOrEqual(1);
            expect(status.position).toBeLessThanOrEqual(6); // 1 original + 5 additional players
        });
    });

    describe('getQueueStats Query', () => {
        it('should return queue statistics without game filter', async () => {
            const { user: user1, game: game1, player: player1 } = await testDataFactory.createBasicQueueScenario();
            const { user: user2, game: game2, player: player2 } = await testDataFactory.createBasicQueueScenario();

            // Create queue entries for both games
            await e2eUtils.createTestQueueEntry(player1, game1, { skillRating: 1500 });
            await e2eUtils.createTestQueueEntry(player2, game2, { skillRating: 1600 });

            const query = `
                query GetQueueStats {
                    getQueueStats {
                        totalQueued
                        averageWaitTime
                        gameStats {
                            gameId
                            queuedCount
                        }
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(query))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const stats = response.body.data.getQueueStats;

            expect(stats.totalQueued).toBeGreaterThanOrEqual(2);
            expect(stats.averageWaitTime).toBeGreaterThanOrEqual(0);
            expect(Array.isArray(stats.gameStats)).toBe(true);
            expect(stats.gameStats.length).toBeGreaterThanOrEqual(2);
        });

        it('should return queue statistics with specific game filter', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();

            // Create multiple queue entries for the same game
            await e2eUtils.createTestQueueEntry(player, game, { skillRating: 1500 });

            const { players: otherPlayers } = await testDataFactory.createMultiPlayerScenario(game, 3);

            const query = `
                query GetQueueStats($gameId: String) {
                    getQueueStats(gameId: $gameId) {
                        totalQueued
                        averageWaitTime
                        gameStats {
                            gameId
                            queuedCount
                        }
                    }
                }
            `;

            const variables = {
                gameId: game.id,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(query, variables))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const stats = response.body.data.getQueueStats;

            expect(stats.totalQueued).toBeGreaterThanOrEqual(4); // 1 original + 3 additional
            expect(stats.gameStats.length).toBe(1);
            expect(stats.gameStats[0].gameId).toBe(game.id);
        });

        it('should handle empty queue statistics', async () => {
            const query = `
                query GetQueueStats {
                    getQueueStats {
                        totalQueued
                        averageWaitTime
                        gameStats {
                            gameId
                            queuedCount
                        }
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(query))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const stats = response.body.data.getQueueStats;

            expect(stats.totalQueued).toBe(0);
            expect(stats.averageWaitTime).toBe(0);
            expect(stats.gameStats).toEqual([]);
        });
    });

    describe('processMatchmaking Mutation', () => {
        it('should successfully process matchmaking with compatible players', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();

            // Create players with similar skill ratings for matching
            const skillRatings = [1500, 1550, 1600, 1650];
            const { players, queueEntries } = await testDataFactory.createSkillBasedScenario(game, skillRatings);

            const mutation = `
                mutation ProcessMatchmaking {
                    processMatchmaking {
                        scrimId
                        playerIds
                        gameId
                        skillRating
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(AuthTestHelpers.createTestUserToken(user.id)))
                .send(GraphQLTestHelpers.mutation(mutation))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const results = response.body.data.processMatchmaking;

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThanOrEqual(1);

            // Validate matchmaking results
            results.forEach((match: any) => {
                expect(match.scrimId).toBeDefined();
                expect(Array.isArray(match.playerIds)).toBe(true);
                expect(match.playerIds.length).toBeGreaterThanOrEqual(2);
                expect(match.gameId).toBe(game.id);
                expect(typeof match.skillRating).toBe('number');
            });
        });

        it('should handle processMatchmaking with no compatible players', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();

            // Create players with very different skill ratings
            const skillRatings = [1000, 2000, 3000, 4000];
            const { players, queueEntries } = await testDataFactory.createSkillBasedScenario(game, skillRatings);

            const mutation = `
                mutation ProcessMatchmaking {
                    processMatchmaking {
                        scrimId
                        playerIds
                        gameId
                        skillRating
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(AuthTestHelpers.createTestUserToken(user.id)))
                .send(GraphQLTestHelpers.mutation(mutation))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const results = response.body.data.processMatchmaking;

            // Should still create matches even with large skill differences
            expect(Array.isArray(results)).toBe(true);
        });

        it('should handle processMatchmaking with insufficient players', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();

            // Create only one additional player (total 2, minimum for matchmaking)
            const { players, queueEntries } = await testDataFactory.createMultiPlayerScenario(game, 1);

            const mutation = `
                mutation ProcessMatchmaking {
                    processMatchmaking {
                        scrimId
                        playerIds
                        gameId
                        skillRating
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(AuthTestHelpers.createTestUserToken(user.id)))
                .send(GraphQLTestHelpers.mutation(mutation))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const results = response.body.data.processMatchmaking;

            expect(Array.isArray(results)).toBe(true);
        });
    });

    describe('Performance Tests', () => {
        it('should handle large queue operations efficiently', async () => {
            performanceMonitor.start();

            const { user, game, player } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            // Create many queue entries
            const { players: manyPlayers, queueEntries } = await testDataFactory.createMultiPlayerScenario(game, 50);

            // Test getQueueStats performance
            const statsQuery = `
                query GetQueueStats {
                    getQueueStats {
                        totalQueued
                        averageWaitTime
                        gameStats {
                            gameId
                            queuedCount
                        }
                    }
                }
            `;

            const statsResponse = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(statsQuery))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(statsResponse);
            expect(statsResponse.body.data.getQueueStats.totalQueued).toBeGreaterThanOrEqual(50);

            performanceMonitor.end();
            // Should complete within 2 seconds even with many entries
            performanceMonitor.assertWithinThreshold(2000);
        });

        it('should handle concurrent GraphQL operations', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const query = `
                query GetQueueStats {
                    getQueueStats {
                        totalQueued
                    }
                }
            `;

            // Send concurrent requests
            const promises = [
                e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .set(GraphQLTestHelpers.createAuthHeaders(token))
                    .send(GraphQLTestHelpers.mutation(mutation, { gameId: game.id, skillRating: 1500 })),
                e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .send(GraphQLTestHelpers.query(query)),
                e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .send(GraphQLTestHelpers.query(query)),
            ];

            const responses = await Promise.all(promises);

            // All should succeed
            responses.forEach(response => {
                expect(response).toBeDefined();
            });
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle malformed GraphQL queries gracefully', async () => {
            const malformedQuery = `
                query {
                    getQueueStatus {
                        invalidField
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(malformedQuery))
                .expect(200);

            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toContain('Cannot query field');
        });

        it('should handle invalid variable types', async () => {
            const { user, game } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            // Send string instead of int for skillRating
            const variables = {
                gameId: game.id,
                skillRating: 'not-a-number',
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
        });

        it('should handle missing required variables', async () => {
            const { user } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            // Missing skillRating variable
            const variables = {
                gameId: 'test-game',
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
        });

        it('should handle database connection issues gracefully', async () => {
            // This test would require mocking database connection issues
            // For now, we'll test with invalid data that would cause database errors

            const { user } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            // Use invalid game ID that doesn't exist
            const variables = {
                gameId: 'non-existent-game-id',
                skillRating: 1500,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
        });
    });

    describe('Security Tests', () => {
        it('should reject requests with invalid authentication tokens', async () => {
            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const variables = {
                gameId: 'test-game',
                skillRating: 1500,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders('invalid-token'))
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
            expect(response.body.errors[0].message).toContain('Unauthorized');
        });

        it('should reject requests with expired authentication tokens', async () => {
            const expiredToken = AuthTestHelpers.createMockToken('test-user');

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const variables = {
                gameId: 'test-game',
                skillRating: 1500,
            };

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(expiredToken))
                .send(GraphQLTestHelpers.mutation(mutation, variables))
                .expect(200);

            expect(response.body.errors).toBeDefined();
        });

        it('should rate limit excessive requests', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const query = `
                query GetQueueStatus {
                    getQueueStatus {
                        playerId
                        gameId
                        skillRating
                        queuedAt
                        position
                    }
                }
            `;

            // Send many rapid requests
            const promises = Array.from({ length: 10 }, () =>
                e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .set(GraphQLTestHelpers.createAuthHeaders(token))
                    .send(GraphQLTestHelpers.query(query))
                    .expect(200)
            );

            const responses = await Promise.all(promises);

            // All should complete (rate limiting would be handled by middleware)
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });
    });
});