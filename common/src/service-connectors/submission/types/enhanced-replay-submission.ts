import type {FranchiseValidationContext} from "./franchise-validation";
import type {RatifierInfo} from "./ratifier-info";
import type {
    ReplaySubmission,
    ReplaySubmissionStatus,
    ReplaySubmissionType,
} from "./replay-submission";
import type {ReplaySubmissionItem} from "./replay-submission-item";
import type {ReplaySubmissionRejection} from "./replay-submission-rejection";
import type {ReplaySubmissionStats} from "./replay-submission-stats";

export interface EnhancedBaseReplaySubmission {
    id: string;
    creatorId: number;
    status: ReplaySubmissionStatus;
    taskIds: string[];
    items: ReplaySubmissionItem[];
    validated: boolean;
    stats?: ReplaySubmissionStats;
    ratifiers: RatifierInfo[]; // Enhanced from number[] to RatifierInfo[]
    requiredRatifications: number;
    rejections: ReplaySubmissionRejection[];
    franchiseValidation: FranchiseValidationContext;
}

export interface EnhancedScrimReplaySubmission extends EnhancedBaseReplaySubmission {
    type: ReplaySubmissionType.SCRIM;
    scrimId: string;
}

export interface EnhancedMatchReplaySubmission extends EnhancedBaseReplaySubmission {
    type: ReplaySubmissionType.MATCH;
    matchId: number;
}

export interface EnhancedLFSReplaySubmission extends EnhancedBaseReplaySubmission {
    type: ReplaySubmissionType.LFS;
    scrimId: string;
}

export type EnhancedReplaySubmission =
  | EnhancedScrimReplaySubmission
  | EnhancedMatchReplaySubmission
  | EnhancedLFSReplaySubmission;

// Backward compatibility type that supports both old and new formats
export type CompatibleReplaySubmission = EnhancedReplaySubmission | ReplaySubmission;
