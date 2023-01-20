import type {ScrimMode, ScrimPlayer, ScrimSettings} from "@sprocketbot/common";

export function getMockScrimSettings(
    teamSize: number,
    teamCount: number,
    mode: ScrimMode,
    competitive: boolean,
    observable: boolean,
    checkinTimeout: number,
): ScrimSettings {
    return {
        teamSize,
        teamCount,
        mode,
        competitive,
        observable,
        checkinTimeout,
    };
}

export function getMockScrimPlayer(
    userId: number,
    name: string,
    joinedAt: Date,
    leaveAt: Date,
    group?: string,
    canSaveDemos = false,
): ScrimPlayer {
    return {
        userId,
        name,
        joinedAt,
        leaveAt,
        group,
        canSaveDemos,
    };
}

export function getMockScrimIds(
    authorUserId = 1,
    organizationId = 1,
    gameModeId = 1,
    skillGroupId = 1,
): {
    authorUserId: number;
    organizationId: number;
    gameModeId: number;
    skillGroupId: number;
} {
    return {
        authorUserId,
        organizationId,
        gameModeId,
        skillGroupId,
    };
}

export const mockPlayerFactories = {
    hyper: (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(1, "HyperCoder", date, date, group),
    tekssx: (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(2, "tekssx", date, date, group),
    shuckle: (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(3, "shuckle", date, date, group),
    nigel: (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(4, "Nigel Thornbrake", date, date, group),
};
