import type {Scrim} from "@sprocketbot/common";

import type {Match} from "../../../database";
import type {ReplaySubmissionItem} from "./submission-item.types";
import type {ISubmissionRejection} from "./submission-rejection.types";
import type {ReplaySubmissionStats} from "./submission-stats.types";

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
    scrimId: Scrim["id"];
}

export interface MatchReplaySubmission extends BaseReplaySubmission {
    type: ReplaySubmissionType.MATCH;
    matchId: Match["id"];
}

export type ReplaySubmission = ScrimReplaySubmission | MatchReplaySubmission;
