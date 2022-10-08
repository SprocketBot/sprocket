import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {SubmissionEndpoint, SubmissionSchemas} from "@sprocketbot/common";

import {ReplaySubmissionCrudService} from "../replay-submission/replay-submission-crud/replay-submission-crud.service";
import {ReplayValidationService} from "./replay-validation.service";
import type {ValidationResult} from "./types/validation-result";

@Controller("replay-validation")
export class ReplayValidationController {
    constructor(
        private readonly replayValidationService: ReplayValidationService,
        private readonly replaySubmissionCrudService: ReplaySubmissionCrudService,
    ) {}

    @MessagePattern(SubmissionEndpoint.ValidateSubmission)
    async validateSubmission(
        @Payload() payload: unknown,
    ): Promise<ValidationResult> {
        const data = SubmissionSchemas.ValidateSubmission.input.parse(payload);
        const submission = await this.replaySubmissionCrudService.getSubmission(
            data.submissionId,
        );
        return this.replayValidationService.validate(submission!);
    }
}
