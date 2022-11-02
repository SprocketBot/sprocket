import type {MatchReplaySubmission, ReplaySubmissionItem, Scrim, ScrimReplaySubmission} from "@sprocketbot/common";
import {ProgressStatus} from "@sprocketbot/common";
import {ScrimStatus} from "@sprocketbot/common";
import {ReplaySubmissionStatus, ReplaySubmissionType, ScrimMode} from "@sprocketbot/common";

export const testSubmission: ScrimReplaySubmission = {
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

export const testMatchSubmission: MatchReplaySubmission = {
    items: [],
    id: "1",
    type: ReplaySubmissionType.MATCH,
    creatorId: 1,
    matchId: 1,
    validated: false,
    status: ReplaySubmissionStatus.VALIDATING,
    taskIds: ["1"],
    ratifiers: [1],
    requiredRatifications: 2,
    rejections: [],
};

export const testItem: ReplaySubmissionItem = {
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

export const testItem2: ReplaySubmissionItem = {
    taskId: "",
    originalFilename: "",
    inputPath: "",
    outputPath: "HAI",
    progress: {
        taskId: "1",
        status: ProgressStatus.Complete,
        progress: {
            value: 10,
            message: "Hai",
        },
        result: null,
        error: null,
    },
};

export const testScrim: Scrim = {
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

    players: [
        {
            id: 1,
            name: "Nigel",
            joinedAt: new Date(),
            leaveAt: new Date(),
        },
    ],
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
const testPlayer = {
    id: 1,
    name: "Nigel",
    joinedAt: new Date(),
    leaveAt: new Date(),
};

export const testScrim2: Scrim = {
    id: "2",
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

    players: [testPlayer],
    games: [
        {
            teams: [
                {
                    players: [testPlayer],
                },
            ],
        },
    ],
    settings: {
        teamSize: 2,
        teamCount: 2,
        mode: ScrimMode.ROUND_ROBIN,
        competitive: true,
        observable: true,
        checkinTimeout: 4,
    },
};
