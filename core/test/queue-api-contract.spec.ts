import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    E2ETestUtils,
    GraphQLTestHelpers,
    TestDataFactory,
    AuthTestHelpers,
} from './e2e-utils';

/**
 * API Contract Validation Tests for Queue GraphQL Endpoints
 * Ensures that GraphQL responses match expected schemas and data contracts
 */
describe('Queue API Contract Validation Tests', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let e2eUtils: E2ETestUtils;
    let testDataFactory: TestDataFactory;

    beforeAll(async () => {
        const testApp = await E2ETestUtils.createTestApp();
        app = testApp.app;
        dataSource = testApp.dataSource;
        e2eUtils = new E2ETestUtils(app, dataSource);
        testDataFactory = new TestDataFactory(e2eUtils);
    });

    afterAll(async () => {
        await e2eUtils.closeTestApp();
    });

    beforeEach(async () => {
        await e2eUtils.cleanupTestData();
    });

    describe('GraphQL Response Schema Validation', () => {
        describe('joinQueue Mutation Contract', () => {
            it('should return boolean type for successful join', async () => {
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

                // Validate response type and structure
                expect(typeof response.body.data.joinQueue).toBe('boolean');
                expect(response.body.data.joinQueue).toBe(true);

                // Ensure no errors in successful response
                expect(response.body.errors).toBeUndefined();
            });

            it('should return proper error structure for failed join', async () => {
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

                // Validate error response structure
                expect(response.body.errors).toBeDefined();
                expect(Array.isArray(response.body.errors)).toBe(true);
                expect(response.body.errors.length).toBeGreaterThan(0);

                const error = response.body.errors[0];
                expect(error.message).toContain('Failed to join queue');
                expect(error.extensions).toBeDefined();
            });

            it('should validate input parameter types', async () => {
                const { user } = await testDataFactory.createBasicQueueScenario();
                const token = AuthTestHelpers.createTestUserToken(user.id);

                const mutation = `
                    mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                        joinQueue(gameId: $gameId, skillRating: $skillRating)
                    }
                `;

                // Test with various input types
                const testCases = [
                    { gameId: 123, skillRating: 1500 }, // number instead of string
                    { gameId: '', skillRating: 1500 }, // empty string
                    { gameId: 'valid-game', skillRating: 'invalid' }, // string instead of int
                    { gameId: 'valid-game', skillRating: -100 }, // negative skill rating
                ];

                for (const variables of testCases) {
                    const response = await e2eUtils.getGraphQLClient()
                        .post('/graphql')
                        .set(GraphQLTestHelpers.createAuthHeaders(token))
                        .send(GraphQLTestHelpers.mutation(mutation, variables))
                        .expect(200);

                    // Should have errors for invalid inputs
                    expect(response.body.errors).toBeDefined();
                }
            });
        });

        describe('leaveQueue Mutation Contract', () => {
            it('should return boolean type for successful leave', async () => {
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

                expect(typeof response.body.data.leaveQueue).toBe('boolean');
                expect(response.body.data.leaveQueue).toBe(true);
                expect(response.body.errors).toBeUndefined();
            });

            it('should return proper error structure when not in queue', async () => {
                const { user, game, player } = await testDataFactory.createBasicQueueScenario({
                    queueEntry: null,
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
        });

        describe('getQueueStatus Query Contract', () => {
            it('should return proper QueueStatus object when in queue', async () => {
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

                // Validate QueueStatus object structure
                expect(status).toBeDefined();
                expect(typeof status.playerId).toBe('string');
                expect(typeof status.gameId).toBe('string');
                expect(typeof status.skillRating).toBe('number');
                expect(new Date(status.queuedAt)).toBeInstanceOf(Date);
                expect(typeof status.position).toBe('number');
                expect(status.position).toBeGreaterThanOrEqual(1);

                // Validate specific values
                expect(status.playerId).toBe(player.id);
                expect(status.gameId).toBe(game.id);
                expect(status.skillRating).toBe(queueEntry.skillRating);
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
        });

        describe('getQueueStats Query Contract', () => {
            it('should return proper QueueStats object structure', async () => {
                const { user, game, player } = await testDataFactory.createBasicQueueScenario();
                await e2eUtils.createTestQueueEntry(player, game, { skillRating: 1500 });

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

                // Validate QueueStats object structure
                expect(stats).toBeDefined();
                expect(typeof stats.totalQueued).toBe('number');
                expect(typeof stats.averageWaitTime).toBe('number');
                expect(Array.isArray(stats.gameStats)).toBe(true);

                // Validate GameQueueStats structure
                if (stats.gameStats.length > 0) {
                    const gameStat = stats.gameStats[0];
                    expect(typeof gameStat.gameId).toBe('string');
                    expect(typeof gameStat.queuedCount).toBe('number');
                    expect(gameStat.queuedCount).toBeGreaterThan(0);
                }

                expect(stats.totalQueued).toBeGreaterThanOrEqual(1);
                expect(stats.averageWaitTime).toBeGreaterThanOrEqual(0);
            });

            it('should handle empty queue stats correctly', async () => {
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

            it('should filter stats by game ID correctly', async () => {
                const { user: user1, game: game1, player: player1 } = await testDataFactory.createBasicQueueScenario();
                const { user: user2, game: game2, player: player2 } = await testDataFactory.createBasicQueueScenario();

                await e2eUtils.createTestQueueEntry(player1, game1, { skillRating: 1500 });
                await e2eUtils.createTestQueueEntry(player2, game2, { skillRating: 1600 });

                const query = `
                    query GetQueueStats($gameId: String) {
                        getQueueStats(gameId: $gameId) {
                            totalQueued
                            gameStats {
                                gameId
                                queuedCount
                            }
                        }
                    }
                `;

                const variables = { gameId: game1.id };

                const response = await e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .send(GraphQLTestHelpers.query(query, variables))
                    .expect(200);

                GraphQLTestHelpers.validateGraphQLResponse(response);
                const stats = response.body.data.getQueueStats;

                expect(stats.totalQueued).toBe(1);
                expect(stats.gameStats.length).toBe(1);
                expect(stats.gameStats[0].gameId).toBe(game1.id);
                expect(stats.gameStats[0].queuedCount).toBe(1);
            });
        });

        describe('processMatchmaking Mutation Contract', () => {
            it('should return proper MatchmakingResult array structure', async () => {
                const { user, game, player } = await testDataFactory.createBasicQueueScenario();

                // Create multiple players for matchmaking
                const skillRatings = [1500, 1550, 1600, 1650];
                await testDataFactory.createSkillBasedScenario(game, skillRatings);

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

                // Validate array structure
                expect(Array.isArray(results)).toBe(true);
                expect(results.length).toBeGreaterThanOrEqual(1);

                // Validate each MatchmakingResult
                results.forEach((match: any) => {
                    expect(typeof match.scrimId).toBe('string');
                    expect(Array.isArray(match.playerIds)).toBe(true);
                    expect(match.playerIds.length).toBeGreaterThanOrEqual(2);
                    expect(typeof match.gameId).toBe('string');
                    expect(typeof match.skillRating).toBe('number');
                    expect(match.skillRating).toBeGreaterThan(0);
                });
            });

            it('should return empty array when no matches possible', async () => {
                const { user, game, player } = await testDataFactory.createBasicQueueScenario();

                // Create only one player (insufficient for matchmaking)
                await e2eUtils.createTestQueueEntry(player, game, { skillRating: 1500 });

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
                expect(response.body.data.processMatchmaking).toEqual([]);
            });
        });
    });

    describe('Authentication and Authorization Contract', () => {
        it('should require authentication for protected mutations', async () => {
            const { game } = await testDataFactory.createBasicQueueScenario();

            const protectedMutations = [
                {
                    name: 'joinQueue',
                    query: `mutation { joinQueue(gameId: "${game.id}", skillRating: 1500) }`,
                },
                {
                    name: 'leaveQueue',
                    query: `mutation { leaveQueue }`,
                },
                {
                    name: 'processMatchmaking',
                    query: `mutation { processMatchmaking { scrimId playerIds gameId skillRating } }`,
                },
            ];

            for (const mutation of protectedMutations) {
                const response = await e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .send(GraphQLTestHelpers.mutation(mutation.query))
                    .expect(200);

                expect(response.body.errors).toBeDefined();
                expect(response.body.errors[0].message).toContain('Unauthorized');
            }
        });

        it('should require authentication for protected queries', async () => {
            const protectedQueries = [
                {
                    name: 'getQueueStatus',
                    query: 'query { getQueueStatus { playerId gameId skillRating queuedAt position } }',
                },
            ];

            for (const query of protectedQueries) {
                const response = await e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .send(GraphQLTestHelpers.query(query.query))
                    .expect(200);

                expect(response.body.errors).toBeDefined();
                expect(response.body.errors[0].message).toContain('Unauthorized');
            }
        });

        it('should allow public access to getQueueStats', async () => {
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
            expect(response.body.data.getQueueStats).toBeDefined();
        });
    });

    describe('Input Validation Contract', () => {
        it('should validate required parameters for joinQueue', async () => {
            const { user } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            // Test missing gameId
            const response1 = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, { skillRating: 1500 }))
                .expect(200);

            expect(response1.body.errors).toBeDefined();

            // Test missing skillRating
            const response2 = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, { gameId: 'test-game' }))
                .expect(200);

            expect(response2.body.errors).toBeDefined();
        });

        it('should validate skill rating bounds', async () => {
            const { user, game } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            // Test various skill rating values
            const skillRatings = [0, 1, 100, 1000, 9999, 10000];

            for (const skillRating of skillRatings) {
                const response = await e2eUtils.getGraphQLClient()
                    .post('/graphql')
                    .set(GraphQLTestHelpers.createAuthHeaders(token))
                    .send(GraphQLTestHelpers.mutation(mutation, { gameId: game.id, skillRating }))
                    .expect(200);

                // Should handle all skill ratings gracefully
                expect(response.body).toBeDefined();
            }
        });
    });

    describe('Error Response Contract', () => {
        it('should return consistent error structure for GraphQL errors', async () => {
            const { user, game } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            // Create a malformed GraphQL query
            const malformedQuery = `
                query {
                    getQueueStatus {
                        invalidFieldThatDoesNotExist
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.query(malformedQuery))
                .expect(200);

            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);

            const error = response.body.errors[0];
            expect(error.message).toBeDefined();
            expect(error.extensions).toBeDefined();
            expect(error.extensions.code).toBeDefined();
        });

        it('should return consistent error structure for business logic errors', async () => {
            const { user, game, player, queueEntry } = await testDataFactory.createBasicQueueScenario();
            const token = AuthTestHelpers.createTestUserToken(user.id);

            const mutation = `
                mutation JoinQueue($gameId: String!, $skillRating: Int!) {
                    joinQueue(gameId: $gameId, skillRating: $skillRating)
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .set(GraphQLTestHelpers.createAuthHeaders(token))
                .send(GraphQLTestHelpers.mutation(mutation, { gameId: game.id, skillRating: 1600 }))
                .expect(200);

            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);

            const error = response.body.errors[0];
            expect(error.message).toContain('Failed to join queue');
            expect(error.extensions).toBeDefined();
        });
    });

    describe('Data Type Contract Validation', () => {
        it('should return correct data types for all queue fields', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();
            await e2eUtils.createTestQueueEntry(player, game, { skillRating: 1750 });

            const query = `
                query GetQueueDataTypes {
                    getQueueStatus {
                        playerId
                        gameId
                        skillRating
                        queuedAt
                        position
                    }
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
                .set(GraphQLTestHelpers.createAuthHeaders(AuthTestHelpers.createTestUserToken(user.id)))
                .send(GraphQLTestHelpers.query(query))
                .expect(200);

            GraphQLTestHelpers.validateGraphQLResponse(response);
            const data = response.body.data;

            // Validate getQueueStatus data types
            expect(typeof data.getQueueStatus.playerId).toBe('string');
            expect(typeof data.getQueueStatus.gameId).toBe('string');
            expect(typeof data.getQueueStatus.skillRating).toBe('number');
            expect(typeof data.getQueueStatus.queuedAt).toBe('string');
            expect(typeof data.getQueueStatus.position).toBe('number');

            // Validate getQueueStats data types
            expect(typeof data.getQueueStats.totalQueued).toBe('number');
            expect(typeof data.getQueueStats.averageWaitTime).toBe('number');
            expect(Array.isArray(data.getQueueStats.gameStats)).toBe(true);

            if (data.getQueueStats.gameStats.length > 0) {
                const gameStat = data.getQueueStats.gameStats[0];
                expect(typeof gameStat.gameId).toBe('string');
                expect(typeof gameStat.queuedCount).toBe('number');
            }
        });

        it('should return correct data types for matchmaking results', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();

            // Create multiple players for matchmaking
            const skillRatings = [1500, 1550];
            await testDataFactory.createSkillBasedScenario(game, skillRatings);

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

            if (results.length > 0) {
                const result = results[0];
                expect(typeof result.scrimId).toBe('string');
                expect(Array.isArray(result.playerIds)).toBe(true);
                expect(typeof result.gameId).toBe('string');
                expect(typeof result.skillRating).toBe('number');
            }
        });
    });

    describe('Response Size and Performance Contract', () => {
        it('should return reasonable response sizes for large datasets', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();

            // Create many queue entries
            const { players: manyPlayers } = await testDataFactory.createMultiPlayerScenario(game, 50);

            const query = `
                query GetLargeQueueStats {
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

            // Validate reasonable response size
            expect(stats.totalQueued).toBeGreaterThanOrEqual(50);
            expect(stats.gameStats.length).toBe(1); // Should be grouped by game
            expect(JSON.stringify(response.body).length).toBeLessThan(10000); // Reasonable size limit
        });

        it('should handle pagination-like behavior for large result sets', async () => {
            const { user, game, player } = await testDataFactory.createBasicQueueScenario();

            // Create many matchmaking results
            const skillRatings = Array.from({ length: 20 }, (_, i) => 1500 + (i * 10));
            await testDataFactory.createSkillBasedScenario(game, skillRatings);

            const mutation = `
                mutation ProcessManyMatches {
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

            // Validate that all results have consistent structure
            results.forEach((result: any) => {
                expect(result.scrimId).toBeDefined();
                expect(Array.isArray(result.playerIds)).toBe(true);
                expect(result.playerIds.length).toBeGreaterThanOrEqual(2);
            });
        });
    });

    describe('GraphQL Best Practices Contract', () => {
        it('should support GraphQL introspection for type discovery', async () => {
            const introspectionQuery = `
                query {
                    __schema {
                        types {
                            name
                            kind
                            description
                        }
                    }
                }
            `;

            const response = await e2eUtils.getGraphQLClient()
                .post('/graphql')
                .send(GraphQLTestHelpers.query(introspectionQuery))
                .expect(200);

            expect(response.body.data.__schema).toBeDefined();
            expect(Array.isArray(response.body.data.__schema.types)).toBe(true);

            // Should include our queue-related types
            const typeNames = response.body.data.__schema.types.map((t: any) => t.name);
            expect(typeNames).toContain('QueueStatus');
            expect(typeNames).toContain('QueueStats');
            expect(typeNames).toContain('MatchmakingResult');
        });

        it('should provide meaningful field descriptions in introspection', async () => {
            const typeQuery = `
                query {
                    __type(name: "QueueStatus") {
                        fields {
                            name
                            description
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

            const fields = response.body.data.__type.fields;
            expect(Array.isArray(fields)).toBe(true);

            // Should have basic field structure
            const fieldNames = fields.map((f: any) => f.name);
            expect(fieldNames).toContain('playerId');
            expect(fieldNames).toContain('gameId');
            expect(fieldNames).toContain('skillRating');
            expect(fieldNames).toContain('queuedAt');
            expect(fieldNames).toContain('position');
        });
    });
});