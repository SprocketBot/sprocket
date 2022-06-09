import type {ReplaySubmissionItem} from "./replay-submission-item";
import type {ISubmissionRejection} from "./replay-submission-rejection";
import type {ReplaySubmissionStats} from "./replay-submission-stats";

export enum ReplaySubmissionType {
    MATCH = "MATCH",
    SCRIM = "SCRIM",
}

export interface BaseReplaySubmission {
    creatorId: number;

    taskIds: string[];
    items: ReplaySubmissionItem[];

    validated: boolean;
    stats?: ReplaySubmissionStats;
    ratifiers: number[];
    requiredRatifications: number;
    rejections: ISubmissionRejection[];
}

export interface ScrimReplaySubmission extends BaseReplaySubmission {
    type: ReplaySubmissionType.SCRIM;
    scrimId: number;
}

export interface MatchReplaySubmission extends BaseReplaySubmission {
    type: ReplaySubmissionType.MATCH;
    matchId: number;
}

export type ReplaySubmission = ScrimReplaySubmission | MatchReplaySubmission;
