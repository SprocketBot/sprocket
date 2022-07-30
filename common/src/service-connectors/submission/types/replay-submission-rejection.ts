import type {
    ReplaySubmissionItem,
} from "./replay-submission-item";

export type RejectedItem = Omit<ReplaySubmissionItem, "progress">;

export interface ReplaySubmissionRejection {
    playerId: string;
    reason: string;
    rejectedItems: RejectedItem[];
    rejectedAt: string;
    stale: boolean;
}
