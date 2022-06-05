import type {ReplaySubmissionItem} from "./submission-item.types";

export interface ISubmissionRejection {
    playerId: number;
    reason: string;
    rejectedItems: ReplaySubmissionItem[];
}
