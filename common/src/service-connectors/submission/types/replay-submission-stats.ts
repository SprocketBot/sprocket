export interface ReplaySubmissionStats {
    games: Array<{
        teams: Array<{
            won: boolean;
            score: number;
            players: Array<{
                name: string;
                goals: number;
            }>;
        }>;
    }>;
}
