import type {
    Scrim, ScrimReplaySubmission,
} from "@sprocketbot/common";

import type {ValidationResult} from "./validation-result";

export type ValidationRule = (submission: ScrimReplaySubmission, scrim: Scrim) => ValidationResult;
