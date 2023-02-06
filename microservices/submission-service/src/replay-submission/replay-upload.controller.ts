import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type { SubmissionOutput} from "@sprocketbot/common";
import {SubmissionEndpoint, SubmissionSchemas} from "@sprocketbot/common";

import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionUtilService} from "./replay-submission-util.service";

@Controller()
export class ReplayUploadController {
    constructor(
        private readonly replaySubmissionUtilService: ReplaySubmissionUtilService,
        private readonly replaySubmissionService: ReplaySubmissionService,
    ) {}

    @MessagePattern(SubmissionEndpoint.CanSubmitReplays)
    async canSubmitReplays(
        @Payload() payload: unknown,
    ): Promise<SubmissionOutput<SubmissionEndpoint.CanSubmitReplays>> {
        const data = SubmissionSchemas.CanSubmitReplays.input.parse(payload);
        return this.replaySubmissionUtilService.canSubmitReplays(data.submissionId, data.userId);
    }

    @MessagePattern(SubmissionEndpoint.CanRatifySubmission)
    async canRatifySubmission(
        @Payload() payload: unknown,
    ): Promise<SubmissionOutput<SubmissionEndpoint.CanRatifySubmission>> {
        const data = SubmissionSchemas.CanRatifySubmission.input.parse(payload);
        return this.replaySubmissionUtilService.canRatifySubmission(data.submissionId, data.userId);
    }

    @MessagePattern(SubmissionEndpoint.SubmitReplays)
    async submitReplays(@Payload() payload: unknown): Promise<SubmissionOutput<SubmissionEndpoint.SubmitReplays>> {
        const data = SubmissionSchemas.SubmitReplays.input.parse(payload);
        return this.replaySubmissionService.beginSubmission(data.filepaths, data.submissionId, data.uploaderUserId);
    }
}
