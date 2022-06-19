import {Injectable} from "@nestjs/common";
import type {ReplaySubmission} from "@sprocketbot/common";

import type {ValidationError, ValidationResult} from "./types/validation-result";

@Injectable()
export class ReplayValidationService {
    validate(submission: ReplaySubmission): ValidationResult {
        const errors: ValidationError[] = [];
        if (submission.items.length > 5) {
            errors.push({error: `Too many games submitted. Expected 5, found ${submission.items.length}`});
        } else if (submission.items.length < 5) {
            errors.push({error: `Not enough games submitted. Expected 5, found ${submission.items.length}`});
        }

        if (errors.length) {
            return {
                valid: false,
                errors: errors,
            };
        }
        return {valid: true};
    }
}
