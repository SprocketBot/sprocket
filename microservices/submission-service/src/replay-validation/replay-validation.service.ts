import {Injectable} from "@nestjs/common";
import type {ReplaySubmission, ScrimReplaySubmission} from "@sprocketbot/common";
import {
    MatchmakingEndpoint, MatchmakingService, ReplaySubmissionType, ResponseStatus,
} from "@sprocketbot/common";

import {gameCount} from "./rules/gameCount";
import type {ValidationResult} from "./types/validation-result";

@Injectable()
export class ReplayValidationService {
    constructor(private readonly matchmakingService: MatchmakingService) {}

    async validate(submission: ReplaySubmission): Promise<ValidationResult> {
        if (submission.type === ReplaySubmissionType.SCRIM) {
            return this.validateScrimSubmission(submission);
        }
        return this.validateMatchSubmission();
    }

    private async validateScrimSubmission(submission: ScrimReplaySubmission): Promise<ValidationResult> {
        const response = await this.matchmakingService.send(MatchmakingEndpoint.GetScrim, submission.scrimId);
        if (response.status === ResponseStatus.ERROR) {
            throw response.error;
        }

        const scrim = response.data;

        // Run validation rules
        return gameCount(submission, scrim);
    }

    private async validateMatchSubmission(): Promise<ValidationResult> {
        return {
            valid: false,
            errors: [ {
                error: "Submitting replays for matches is not yet supported",
            } ],
        };
    }
}
