import {CoreEndpoint, CoreService, MatchmakingService, MinioService, ResponseStatus} from "@sprocketbot/common";
import {Readable} from "stream";
import {anything, instance, mock, when} from "ts-mockito";

import {ReplayValidationService} from "./replay-validation.service";
import {rawResponse, testResponse} from "./utils/ballchasing-response.test-data";
import {
    testItem,
    testItem2,
    testItemNoOutputPath,
    testMatchSubmission,
    testScrim,
    testScrim2,
    testScrim3,
    testScrimNoGames,
    testSubmission,
} from "./utils/replay-validation.test-data";
import {sortIds} from "./utils/sortIds";

describe("ReplayValidationService", () => {
    let service: ReplayValidationService;

    const coreService: CoreService = mock(CoreService);
    const matchmakingService: MatchmakingService = mock(MatchmakingService);
    const minioService: MinioService = mock(MinioService);

    beforeEach(async () => {
        // Mock matchmakingService's send
        when(matchmakingService.send(anything(), anything())).thenCall(async () => {
            return {
                status: ResponseStatus.SUCCESS,
                data: testScrim,
            };
        });

        when(coreService.send(CoreEndpoint.GetGameByGameMode, anything())).thenCall(async () => {
            return {
                status: ResponseStatus.SUCCESS,
                data: {
                    id: 1,
                    title: "Rocket League",
                },
            };
        });

        when(coreService.send(CoreEndpoint.GetPlayersByPlatformIds, anything())).thenCall(async () => {
            return {
                status: ResponseStatus.SUCCESS,
                data: [
                    {
                        status: ResponseStatus.SUCCESS,
                        success: true,
                        data: {
                            id: 1,
                            userId: 1,
                            skillGroupId: 5,
                            franchise: {
                                name: "Frogs",
                            },
                        },
                    },
                ],
            };
        });

        when(minioService.get(anything(), anything())).thenCall(async () => {
            return Readable.from(JSON.stringify({data: rawResponse}));
            // return rawResponse;
        });

        const mmsInstance = instance(matchmakingService);
        const csInstance = instance(coreService);
        const msInstance = instance(minioService);
        service = new ReplayValidationService(csInstance, mmsInstance, msInstance);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("Sort IDs:", () => {
        it("Should sort properly", () => {
            const inputGames = [
                [
                    [1, 2],
                    [3, 4],
                ],
                [
                    [2, 1],
                    [3, 4],
                ],
                [
                    [4, 3],
                    [2, 1],
                ],
            ];
            const expectedOutput = [
                [
                    [1, 2],
                    [3, 4],
                ],
                [
                    [1, 2],
                    [3, 4],
                ],
                [
                    [1, 2],
                    [3, 4],
                ],
            ];
            expect(sortIds(inputGames)).toStrictEqual(expectedOutput);
        });
    });

    describe("Check parent method branches properly:", () => {
        it("Should validate as a scrim", async () => {
            const scrimResponseObject = {
                valid: true,
                errors: [
                    {
                        error: "This is a scrim",
                    },
                ],
            };
            service.validateScrimSubmission = async _ => {
                return scrimResponseObject;
            };
            expect(await service.validate(testSubmission)).toStrictEqual(scrimResponseObject);
        });

        it("Should validate as a match", async () => {
            const matchResponseObject = {
                valid: true,
                errors: [
                    {
                        error: "This is a match",
                    },
                ],
            };
            service.validateMatchSubmission = async _ => {
                return matchResponseObject;
            };

            expect(await service.validate(testMatchSubmission)).toStrictEqual(matchResponseObject);
        });
    });

    describe("Validate Scrims:", () => {
        it("Should validate that the two arrays are the same length", () => {
            expect(service.validateNumberOfGames(testSubmission, testScrim)).toStrictEqual({valid: true});
        });

        it("Should pass validation because there are no error progress messages yet", () => {
            expect(service.checkForProcessingErrors(testSubmission, testScrim)).toStrictEqual({valid: true});
        });

        it("Should return an error for different length arrays", () => {
            testSubmission.items.push(testItem);
            expect(service.validateNumberOfGames(testSubmission, testScrim)).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "Incorrect number of replays submitted, expected 0 but found 1",
                    },
                ],
            });
        });

        it("Should fail validation because there's an error progress message.", () => {
            expect(service.checkForProcessingErrors(testSubmission, testScrim)).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "Error encountered while parsing file ",
                    },
                ],
            });
        });

        it("Should fail because outputPath is missing.", () => {
            expect(service.checkOutputPathExists(testSubmission, testScrim)).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "Unable to validate submission with missing outputPath, scrim=1 submissionId=1",
                    },
                ],
            });
        });

        it("Should pass because outputPath now has a value.", () => {
            testSubmission.items.splice(0, 1);
            testSubmission.items.push(testItem2);
            expect(service.checkOutputPathExists(testSubmission, testScrim)).toStrictEqual({valid: true});
        });

        it("Should pass with appropriate stats object", async () => {
            expect(await service.checkForAllStats([testResponse], testSubmission, testScrim)).toStrictEqual({
                valid: true,
            });
        });

        it("Should fail when there are not enough stats objects", async () => {
            expect(await service.checkForAllStats([], testSubmission, testScrim)).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "The submission is missing stats. Please contact support.",
                    },
                ],
            });
        });

        it("Should run the whole scrim validation method and pass", async () => {
            testSubmission.items.splice(0, 1);
            expect(await service.validateScrimSubmission(testSubmission)).toStrictEqual({valid: true});
        });

        it("Should fail because one player isn't in the right skillGroup", async () => {
            when(coreService.send(CoreEndpoint.GetPlayersByPlatformIds, anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: [
                        {
                            status: ResponseStatus.SUCCESS,
                            success: true,
                            data: {
                                id: 1,
                                userId: 1,
                                skillGroupId: 4,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                        },
                    ],
                };
            });

            const mmsInstance = instance(matchmakingService);
            const csInstance = instance(coreService);
            const msInstance = instance(minioService);
            service = new ReplayValidationService(csInstance, mmsInstance, msInstance);

            expect(await service.validateScrimSubmission(testSubmission)).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "One of the players isn't in the correct skill group",
                    },
                ],
            });
        });

        it("Should check for scrims with actual games", async () => {
            when(matchmakingService.send(anything(), anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: testScrim2,
                };
            });

            when(coreService.send(CoreEndpoint.GetPlayersByPlatformIds, anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: [
                        {
                            success: true,
                            data: {
                                id: 1,
                                userId: 1,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "EPIC",
                                platformId: "80fc09bb4a6f41688c316555a7606a4a",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 2,
                                userId: 2,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198216346683",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 3,
                                userId: 3,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561197991590963",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 4,
                                userId: 4,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198120437724",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 5,
                                userId: 5,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198168202408",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 6,
                                userId: 6,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198295649588",
                                gameId: 1,
                            },
                        },
                    ],
                };
            });

            const mmsInstance = instance(matchmakingService);
            const csInstance = instance(coreService);
            const msInstance = instance(minioService);
            service = new ReplayValidationService(csInstance, mmsInstance, msInstance);

            testSubmission.items.push(testItem2);
            expect(await service.validateScrimSubmission(testSubmission)).toStrictEqual({
                valid: true,
            });
        });

        it("Should fail for mismatched players", async () => {
            when(matchmakingService.send(anything(), anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: testScrim3,
                };
            });

            when(coreService.send(CoreEndpoint.GetPlayersByPlatformIds, anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: [
                        {
                            success: true,
                            data: {
                                id: 7,
                                userId: 7,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "EPIC",
                                platformId: "80fc09bb4a6f41688c316555a7606a4a",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 2,
                                userId: 2,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198216346683",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 3,
                                userId: 3,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561197991590963",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 4,
                                userId: 4,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198120437724",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 5,
                                userId: 5,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198168202408",
                                gameId: 1,
                            },
                        },
                        {
                            success: true,
                            data: {
                                id: 6,
                                userId: 6,
                                skillGroupId: 5,
                                franchise: {
                                    name: "Frogs",
                                },
                            },
                            request: {
                                platform: "STEAM",
                                platformId: "76561198295649588",
                                gameId: 1,
                            },
                        },
                    ],
                };
            });

            const mmsInstance = instance(matchmakingService);
            const csInstance = instance(coreService);
            const msInstance = instance(minioService);
            service = new ReplayValidationService(csInstance, mmsInstance, msInstance);

            testSubmission.items.push(testItem2);
            expect(await service.validateScrimSubmission(testSubmission)).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "Mismatched player",
                        gameIndex: 0,
                    },
                ],
            });
        });

        it("Should fail due to having different numbers of replays and expected games", async () => {
            when(matchmakingService.send(anything(), anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: testScrim,
                };
            });

            const mmsInstance = instance(matchmakingService);
            const csInstance = instance(coreService);
            const msInstance = instance(minioService);
            service = new ReplayValidationService(csInstance, mmsInstance, msInstance);

            testSubmission.items.push(testItem);
            const testFn = async () => {
                try {
                    return await service.validateScrimSubmission(testSubmission);
                } catch (e) {
                    return e;
                }
            };

            expect(await testFn()).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "Incorrect number of replays submitted, expected 0 but found 3",
                    },
                ],
            });

            // Reset test submission's state
            testSubmission.items.splice(0, 3);
        });

        it("Should fail for a scrim with no games", async () => {
            when(matchmakingService.send(anything(), anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: testScrimNoGames,
                };
            });

            const mmsInstance = instance(matchmakingService);
            const csInstance = instance(coreService);
            const msInstance = instance(minioService);
            service = new ReplayValidationService(csInstance, mmsInstance, msInstance);

            const testFn = async () => {
                try {
                    await service.validateScrimSubmission(testSubmission);
                } catch (e) {
                    return e;
                }
            };

            expect(await testFn()).toStrictEqual(
                Error("Unable to validate gameCount for scrim 4 because it has no games"),
            );
        });

        it("Should fail due to processing error in one of the submission items", async () => {
            when(matchmakingService.send(anything(), anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: testScrim2,
                };
            });

            const mmsInstance = instance(matchmakingService);
            const csInstance = instance(coreService);
            const msInstance = instance(minioService);
            service = new ReplayValidationService(csInstance, mmsInstance, msInstance);

            testSubmission.items.push(testItem);
            const testFn = async () => {
                try {
                    return await service.validateScrimSubmission(testSubmission);
                } catch (e) {
                    return e;
                }
            };

            expect(await testFn()).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "Error encountered while parsing file ",
                    },
                ],
            });

            testSubmission.items.splice(0, 1);
        });

        it("Should fail for missing output path", async () => {
            when(matchmakingService.send(anything(), anything())).thenCall(async () => {
                return {
                    status: ResponseStatus.SUCCESS,
                    data: testScrim2,
                };
            });

            const mmsInstance = instance(matchmakingService);
            const csInstance = instance(coreService);
            const msInstance = instance(minioService);
            service = new ReplayValidationService(csInstance, mmsInstance, msInstance);

            testSubmission.items.push(testItemNoOutputPath);
            const testFn = async () => {
                try {
                    return await service.validateScrimSubmission(testSubmission);
                } catch (e) {
                    return e;
                }
            };

            expect(await testFn()).toStrictEqual({
                valid: false,
                errors: [
                    {
                        error: "Unable to validate submission with missing outputPath, scrim=2 submissionId=1",
                    },
                ],
            });
        });
    });
});
