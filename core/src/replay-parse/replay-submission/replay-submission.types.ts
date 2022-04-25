import type {Scrim} from "@sprocketbot/common";

import type {Match} from "../../database";

export enum ReplaySubmissionType {
    MATCH = "MATCH",
    SCRIM = "SCRIM",
}

export interface BaseReplaySubmission {
    taskIds: string[];
    objects: string[];
    validated: boolean;

    creatorId: number;
    ratifiers: number[];
    requiredRatifications: number;
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
