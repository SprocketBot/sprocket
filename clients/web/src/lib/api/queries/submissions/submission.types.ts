export interface SubmissionRejection {
    playerId: string;
    playerName: string;
    reason: string;
    stale: boolean;
}
export interface SubmissionProgress {
    progress: {
        value: number;
        message: string;
    };
    status: "Pending" | "Error" | "Complete";
    taskId: string;
    error?: string;
}

export interface Submission {
    id: string;
    status: string;
    creatorId: number;
    ratifications: number;
    requiredRatifications: number;
    userHasRatified: boolean;
    type: "MATCH" | "SCRIM";
    scrimId?: string;
    matchId?: number;
    stale: boolean;
    items: Array<{
        taskId: string;
        originalFilename: string;
        progress: SubmissionProgress;
    }>;
    rejections: SubmissionRejection[];
    validated: boolean;
    stats: {
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
    };
}
