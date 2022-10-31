import {BallchasingResponseSchema, CoreService, MatchmakingService, MinioService} from "@sprocketbot/common";
import {mock} from "ts-mockito";

import {ReplayValidationService} from "./replay-validation.service";
import {testResponse} from "./utils/ballchasing-response.test-data";
import {testItem, testItem2, testScrim, testSubmission} from "./utils/replay-validation.test-data";
import {sortIds} from "./utils/sortIds";

describe("ReplayValidationService", () => {
    let service: ReplayValidationService;

    const coreService: CoreService = mock(CoreService);
    const matchmakingService: MatchmakingService = mock(MatchmakingService);
    const minioService: MinioService = mock(MinioService);

    beforeEach(async () => {
        service = new ReplayValidationService(coreService, matchmakingService, minioService);
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
    });
});
