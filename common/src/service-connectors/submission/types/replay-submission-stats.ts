export type ReplaySubmissionTeamResult = "WIN" | "LOSS" | "DRAW" | "UNKNOWN";

export interface ReplaySubmissionStats {
    games: Array<{
        teams: Array<{
            result?: ReplaySubmissionTeamResult;
            score?: number;
            stats?: Record<string, number>;
            players: Array<{
                name: string;
                stats?: Record<string, number>;
            }>;
        }>;
    }>;
}
