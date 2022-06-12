import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {SubmissionEndpoint, SubmissionSchemas} from "@sprocketbot/common";

import {ReplaySubmissionRatificationService} from "./replay-submission-ratification.service";

@Controller()
export class ReplaySubmissionRatificationController {
    constructor(private readonly ratificationService: ReplaySubmissionRatificationService) {}

    @MessagePattern(SubmissionEndpoint.ResetSubmission)
    async resetSubmission(@Payload() payload: unknown): Promise<void> {
        const data = SubmissionSchemas.ResetSubmission.input.parse(payload);
        await this.ratificationService.resetSubmission(data.submissionId, data.override, data.playerId);
    }

    @MessagePattern(SubmissionEndpoint.RatifySubmission)
    async ratifySubmission(@Payload() payload: unknown): Promise<void> {
        const data = SubmissionSchemas.RatifySubmission.input.parse(payload);
        await this.ratificationService.ratifyScrim(data.playerId, data.submissionId);
    }

    @MessagePattern(SubmissionEndpoint.RejectSubmission)
    async rejectSubmission(@Payload() payload: unknown): Promise<void> {
        const data = SubmissionSchemas.RejectSubmission.input.parse(payload);
        await this.ratificationService.rejectSubmission(data.playerId, data.submissionId, data.reason);
    }
}
