import {Injectable} from "@nestjs/common";
import type {
    BallchasingPlayer,
    BallchasingResponse,
    BallchasingTeam,
} from "@sprocketbot/common";

@Injectable()
export class BallchasingConverterService {
    createRound(b: BallchasingResponse): unknown {
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

    createTeamStats(b: BallchasingTeam): unknown {
        return {
            name: b.name,
            color: b.color,
            stats: b.stats,
        };
    }

    createPlayerStats(b: BallchasingPlayer): unknown {
        return b;
    }
}
