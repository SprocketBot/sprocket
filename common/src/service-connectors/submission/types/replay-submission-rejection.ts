import type {ReplaySubmissionItem} from "./replay-submission-item";

export type RejectedItem = Omit<ReplaySubmissionItem, "progress">;

export const REPLAY_SUBMISSION_REJECTION_SYSTEM_PLAYER_ID = -1;

export interface ReplaySubmissionRejection {
    userId: number;
    reason: string;
    rejectedItems: RejectedItem[];
    rejectedAt: string;
    stale: boolean;
}
