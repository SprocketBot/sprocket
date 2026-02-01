export interface RatifierInfo {
    playerId: number;
    franchiseId: number;
    franchiseName: string;
    ratifiedAt: string;
}

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
    ratifiers: RatifierInfo[];
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
                result?: "WIN" | "LOSS" | "DRAW" | "UNKNOWN";
                score?: number;
                stats?: Record<string, number>;
                players: Array<{
                    name: string;
                    stats?: Record<string, number>;
                }>;
            }>;
        }>;
    };
}
