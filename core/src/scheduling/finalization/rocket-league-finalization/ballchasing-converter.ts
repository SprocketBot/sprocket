import type {BallchasingPlayer, BallchasingResponse, BallchasingTeam} from "@sprocketbot/common";

export function createRound(b: BallchasingResponse): unknown {
    return {
        title: b.title,
        parser: "ballchasing",
        date: new Date(b.date),

        ballchasingId: b.id,
        psyonixId: b.match_guid,

        duration: b.duration,
        overtime: b.overtime,
        overtimeSeconds: b.overtime_seconds,

        match_type: b.match_type,

        playlist: {
            id: b.playlist_id,
            name: b.playlist_name,
        },
        map: {
            code: b.map_code,
            name: b.map_name,
        },
        uploader: b.uploader,
        teamSizes: b.team_size,
    };
}

export function createTeamStats(b: BallchasingTeam): unknown {
    return {
        name: b.name,
        color: b.color,
        stats: b.stats,
    };
}

export function createPlayerStats(b: BallchasingPlayer): unknown {
    return b;
}

export function xboxIdToBC(xboxId: string): string {
    const idHex = ("0000" + parseInt(xboxId).toString(16)).slice(-16);
    return idHex
        .split(/(?=(?:..)*$)/)
        .reverse()
        .join("");
}

export function bcToXboxId(bcId: string): string {
    const hexGroups = bcId.split(/(?=(?:..)*$)/);
    const join = hexGroups.reverse().join("");
    return parseInt(join, 16).toString(10);
}
