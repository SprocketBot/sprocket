export interface ReplaySubmissionStats {
    games: Array<{
        teams: Array<{
            // TODO in the future, we will want this to be a member
            players: string[];
            won: boolean;
        }>;
    }>;
}
