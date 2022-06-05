import type {ReplaySubmissionItem} from "./submission-item.types";

export type RejectedItem = Omit<ReplaySubmissionItem, "progress">;

export interface ISubmissionRejection {
    playerId: number;
    reason: string;
    rejectedItems: RejectedItem[];
    rejectedAt: string;
}
