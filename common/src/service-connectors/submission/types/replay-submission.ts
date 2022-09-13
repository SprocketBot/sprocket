import type {ReplaySubmissionItem} from "./replay-submission-item";
import type {ReplaySubmissionRejection} from "./replay-submission-rejection";
import type {ReplaySubmissionStats} from "./replay-submission-stats";

export enum ReplaySubmissionType {
    MATCH = "MATCH",
    SCRIM = "SCRIM",
}

export enum ReplaySubmissionStatus {
    PROCESSING = "PROCESSING",
    RATIFYING = "RATIFYING",
    VALIDATING = "VALIDATING",
    RATIFIED = "RATIFIED",
    REJECTED = "REJECTED",
}

export interface BaseReplaySubmission {
    id: string;
    creatorId: number;

    status: ReplaySubmissionStatus;

    taskIds: string[];
    items: ReplaySubmissionItem[];

    validated: boolean;
    stats?: ReplaySubmissionStats;
    ratifiers: number[];
    requiredRatifications: number;
    rejections: ReplaySubmissionRejection[];
}

export interface ScrimReplaySubmission extends BaseReplaySubmission {
    type: ReplaySubmissionType.SCRIM;
    scrimId: string;
}

export interface MatchReplaySubmission extends BaseReplaySubmission {
    type: ReplaySubmissionType.MATCH;
    matchId: number;
}

export type ReplaySubmission = ScrimReplaySubmission | MatchReplaySubmission;
