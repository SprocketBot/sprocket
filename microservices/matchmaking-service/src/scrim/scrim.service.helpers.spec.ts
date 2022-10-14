import type {
    ScrimMode, ScrimPlayer, ScrimSettings,
} from "@sprocketbot/common";

export function scrimSettings(
    teamSize: number,
    teamCount: number,
    mode: ScrimMode,
    competitive: boolean,
    observable: boolean,
    checkinTimeout: number,
): ScrimSettings {
    return {
        teamSize, teamCount, mode, competitive, observable, checkinTimeout,
    };
}

export function scrimPlayer(
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

export function scrimIds(
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

export const players = {
    "hyper": (date: Date, group?: string): ScrimPlayer => scrimPlayer(1, "HyperCoder", date, date, group),
    "tekssx": (date: Date, group?: string): ScrimPlayer => scrimPlayer(2, "tekssx", date, date, group),
    "shuckle": (date: Date, group?: string): ScrimPlayer => scrimPlayer(3, "shuckle", date, date, group),
    "nigel": (date: Date, group?: string): ScrimPlayer => scrimPlayer(4, "Nigel Thornbrake", date, date, group),
};
