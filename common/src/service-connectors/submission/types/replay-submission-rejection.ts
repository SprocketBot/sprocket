import type {
    ReplaySubmissionItem,
} from "./replay-submission-item";

export type RejectedItem = Omit<ReplaySubmissionItem, "progress">;

export interface ISubmissionRejection {
    playerId: number;
    reason: string;
    rejectedItems: RejectedItem[];
    rejectedAt: string;
}
