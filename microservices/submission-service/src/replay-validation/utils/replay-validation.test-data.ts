import type {MatchSubmission, Scrim, ScrimSubmission, SubmissionItem} from "@sprocketbot/common";
import {ProgressStatus, ScrimMode, ScrimStatus, SubmissionStatus, SubmissionType} from "@sprocketbot/common";

export const testSubmission: ScrimSubmission = {
    items: [],
    id: "1",
    type: SubmissionType.Scrim,
    scrimId: "1",
    uploaderUserId: 1,
    validated: false,
    status: SubmissionStatus.Validating,
    ratifications: [{userId: 1, ratifiedAt: new Date()}],
    requiredRatifications: 2,
    rejections: [],
    rounds: [],
};

export const testMatchSubmission: MatchSubmission = {
    items: [],
    id: "1",
    type: SubmissionType.Match,
    uploaderUserId: 1,
    matchId: 1,
    validated: false,
    status: SubmissionStatus.Validating,
    ratifications: [{userId: 1, ratifiedAt: new Date()}],
    requiredRatifications: 2,
    rejections: [],
    rounds: [],
};

export const testItem: SubmissionItem = {
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

export const testItem2: SubmissionItem = {
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

export const testItemNoOutputPath: SubmissionItem = {
    taskId: "4",
    originalFilename: "something.replay",
    inputPath: "something.replay",
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
    authorUserId: 1,
    organizationId: 2,
    gameModeId: 1,
    skillGroupId: 5,
    timeoutJobId: 1,

    players: [
        {
            userId: 1,
            name: "Nigel",
            canSaveDemos: true,
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
    userId: 1,
    name: "Nigel",
    joinedAt: new Date(),
    leaveAt: new Date(),
    canSaveDemos: false,
    request: {
        platform: "EPIC",
        platformId: "80fc09bb4a6f41688c316555a7606a4a",
    },
};

const testPlayer2 = {
    userId: 2,
    name: "Precision",
    joinedAt: new Date(),
    leaveAt: new Date(),
    canSaveDemos: false,
    request: {
        platform: "STEAM",
        platformId: "76561198216346683",
    },
};

const testPlayer3 = {
    userId: 3,
    name: "Kovalchuk",
    joinedAt: new Date(),
    leaveAt: new Date(),
    canSaveDemos: false,
    request: {
        platform: "STEAM",
        platformId: "76561197991590963",
    },
};

const testPlayer4 = {
    userId: 4,
    name: "Andrueninja",
    joinedAt: new Date(),
    leaveAt: new Date(),
    canSaveDemos: false,
    request: {
        platform: "STEAM",
        platformId: "76561198120437724",
    },
};

const testPlayer5 = {
    userId: 5,
    name: "David.",
    joinedAt: new Date(),
    leaveAt: new Date(),
    canSaveDemos: false,
    request: {
        platform: "STEAM",
        platformId: "76561198168202408",
    },
};

const testPlayer6 = {
    userId: 6,
    name: "Boby Shew",
    joinedAt: new Date(),
    leaveAt: new Date(),
    canSaveDemos: false,
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
    authorUserId: 1,
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
    authorUserId: 1,
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

export const testScrimNoGames: Scrim = {
    id: "4",
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ScrimStatus.IN_PROGRESS,
    unlockedStatus: ScrimStatus.IN_PROGRESS,

    submissionId: "1",
    authorUserId: 1,
    organizationId: 2,
    gameModeId: 1,
    skillGroupId: 5,
    timeoutJobId: 1,

    players: [testPlayer, testPlayer2, testPlayer3, testPlayer4, testPlayer5, testPlayer6],
    settings: {
        teamSize: 2,
        teamCount: 2,
        mode: ScrimMode.ROUND_ROBIN,
        competitive: true,
        observable: true,
        checkinTimeout: 4,
    },
};
