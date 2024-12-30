import type {
    ScrimMode, ScrimPlayer, ScrimSettings,
} from "@sprocketbot/common";

export function getMockScrimSettings(
    teamSize: number,
    teamCount: number,
    mode: ScrimMode,
    competitive: boolean,
    observable: boolean,
    checkinTimeout: number,
    lfs: boolean = false,
): ScrimSettings {
    return {
        teamSize, teamCount, mode, competitive, observable, lfs, checkinTimeout,
    };
}

export function getMockScrimPlayer(
    id: number,
    name: string,
    joinedAt: Date,
    leaveAt: Date,
    group?: string,
): ScrimPlayer {
    return {
        id, name, joinedAt, leaveAt, group,
    };
}

export function getMockScrimIds(
    authorId: number = 1,
    organizationId: number = 1,
    gameModeId: number = 1,
    skillGroupId: number = 1,
): {
        authorId: number;
        organizationId: number;
        gameModeId: number;
        skillGroupId: number;
    } {
    return {
        authorId, organizationId, gameModeId, skillGroupId,
    };
}

export const mockPlayerFactories = {
    "hyper": (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(1, "HyperCoder", date, date, group),
    "tekssx": (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(2, "tekssx", date, date, group),
    "shuckle": (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(3, "shuckle", date, date, group),
    "nigel": (date: Date, group?: string): ScrimPlayer => getMockScrimPlayer(4, "Nigel Thornbrake", date, date, group),
};
