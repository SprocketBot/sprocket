import type {MatchReplaySubmission, ReplaySubmissionItem, Scrim, ScrimReplaySubmission} from "@sprocketbot/common";
import {
    ProgressStatus,
    ReplaySubmissionStatus,
    ReplaySubmissionType,
    ScrimMode,
    ScrimStatus,
} from "@sprocketbot/common";

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
    taskId: "4",
    originalFilename: "something.replay",
    inputPath: "something.replay",
    outputPath: "HAI.json",
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
    request: {
        platform: "EPIC",
        platformId: "80fc09bb4a6f41688c316555a7606a4a",
    },
};

const testPlayer2 = {
    id: 2,
    name: "Precision",
    joinedAt: new Date(),
    leaveAt: new Date(),
    request: {
        platform: "STEAM",
        platformId: "76561198216346683",
    },
};

const testPlayer3 = {
    id: 3,
    name: "Kovalchuk",
    joinedAt: new Date(),
    leaveAt: new Date(),
    request: {
        platform: "STEAM",
        platformId: "76561197991590963",
    },
};

const testPlayer4 = {
    id: 4,
    name: "Andrueninja",
    joinedAt: new Date(),
    leaveAt: new Date(),
    request: {
        platform: "STEAM",
        platformId: "76561198120437724",
    },
};

const testPlayer5 = {
    id: 5,
    name: "David.",
    joinedAt: new Date(),
    leaveAt: new Date(),
    request: {
        platform: "STEAM",
        platformId: "76561198168202408",
    },
};

const testPlayer6 = {
    id: 6,
    name: "Boby Shew",
    joinedAt: new Date(),
    leaveAt: new Date(),
    request: {
        platform: "STEAM",
        platformId: "76561198295649588",
    },
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

    players: [testPlayer, testPlayer2, testPlayer3, testPlayer4, testPlayer5, testPlayer6],
    games: [
        {
            teams: [
                {
                    players: [testPlayer, testPlayer2, testPlayer3],
                },
                {
                    players: [testPlayer4, testPlayer5, testPlayer6],
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

export const testScrim3: Scrim = {
    id: "3",
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

    players: [testPlayer, testPlayer2, testPlayer3, testPlayer4, testPlayer5, testPlayer6],
    games: [
        {
            teams: [
                {
                    players: [testPlayer, testPlayer2, testPlayer3],
                },
                {
                    players: [testPlayer4, testPlayer5, testPlayer6],
                },
            ],
        },
        {
            teams: [
                {
                    players: [testPlayer, testPlayer2, testPlayer3],
                },
                {
                    players: [testPlayer4, testPlayer5, testPlayer6],
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
