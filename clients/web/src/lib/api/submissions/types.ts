export interface Match {
    id: number;
    rounds: Array<{
        id: number;
    }>;
    skillGroup: {
        profile: {
            description: string;
        };
    };
    gameMode: {
        description: string;
    };
    matchParent: {
        fixture: {
            scheduleGroup: {
                description: string | null;
            };
            homeFranchise: {
                profile: {
                    title: string;
                };
            };
            awayFranchise: {
                profile: {
                    title: string;
                };
            };
        };
    };
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
    filename: string;
    error?: string;
}

export interface Submission {
    id: string;
    status: string;
    ratifications: number;
    requiredRatifications: number;
    userHasRatified: boolean;
    type: "MATCH" | "SCRIM";
    scrimId: string | null;
    matchId: string | null;
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

export enum ProgressStatus {
    Pending = "Pending",
    Complete = "Complete",
    Error = "Error",
}

export interface Progress {
    value: number;
    message: string;
}

export interface ProgressMessage<TaskResult> {
    taskId: string;
    
    status: ProgressStatus;
    progress: Progress;

    result: TaskResult | null;
    error: string | null;
}

export interface CurrentScrim {
    id: string;
    playerCount: number;
    maxPlayers: number;
    status: string;
    createdAt: Date;
    skillGroup: {
        profile: {
            description: string;
        };
    };
    currentGroup?: {
        code: string;
        players: string[];
    };
    gameMode: {
        description: string;
        game: {
            title: string;
        };
    };
    settings: {
        competitive: boolean;
        mode: string;
    };
    players: Array<{
        id: number;
        name: string;
        checkedIn: boolean;
    }>;
    playersAdmin: Array<{
        id: number;
        name: string;
    }>;
    lobby: {
        name: string;
        password: string;
    };

    games: Array<{
        teams: Array<{
            won: boolean | undefined,
            score: number | undefined,
            players: Array<{
                id: number;
                name: string;
                goals: number | undefined;
            }>;
        }>;
    }>;

    submissionId?: string;
}

export interface SubmissionStatsData {
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