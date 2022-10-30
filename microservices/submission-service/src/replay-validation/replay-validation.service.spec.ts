import type {ReplaySubmissionItem, Scrim, ScrimReplaySubmission} from "@sprocketbot/common";
import {ProgressStatus} from "@sprocketbot/common";
import {ScrimStatus} from "@sprocketbot/common";
import {ScrimMode} from "@sprocketbot/common";
import {
    CoreService,
    MatchmakingService,
    MinioService,
    ReplaySubmissionStatus,
    ReplaySubmissionType,
} from "@sprocketbot/common";
import {mock} from "ts-mockito";

import {ReplayValidationService} from "./replay-validation.service";

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

    describe("Validate Scrims:", () => {
        const testSubmission: ScrimReplaySubmission = {
            items: [],
            id: "1",
            type: ReplaySubmissionType.SCRIM,
            scrimId: "1",
            creatorId: 1,
            validated: false,
            status: ReplaySubmissionStatus.VALIDATING,
            taskIds: ["1"],
            ratifiers: [1],
            requiredRatifications: 2,
            rejections: [],
        };
        const testItem: ReplaySubmissionItem = {
            taskId: "",
            originalFilename: "",
            inputPath: "",
            progress: {
                taskId: "1",
                status: ProgressStatus.Error,
                progress: {
                    value: 10,
                    message: "Hai",
                },
                result: null,
                error: "Test error",
            },
        };
        const testScrim: Scrim = {
            id: "1",
            createdAt: new Date(),
            updatedAt: new Date(),
            status: ScrimStatus.IN_PROGRESS,
            unlockedStatus: ScrimStatus.IN_PROGRESS,

            submissionId: "1",
            authorId: 1,
            organizationId: 2,
            gameModeId: 1,
            skillGroupId: 5,
            timeoutJobId: 1,

            players: [],
            games: [],
            settings: {
                teamSize: 2,
                teamCount: 2,
                mode: ScrimMode.ROUND_ROBIN,
                competitive: true,
                observable: true,
                checkinTimeout: 4,
            },
        };

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
    });
});
