import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {ICanSubmitReplays_Response} from "@sprocketbot/common";
import {SubmissionEndpoint, SubmissionSchemas} from "@sprocketbot/common";

import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionUtilService} from "./replay-submission-util.service";

@Controller("replay-submission")
export class ReplaySubmissionController {
    constructor(
        private readonly replaySubmissionUtilService: ReplaySubmissionUtilService,
        private readonly replaySubmissionService: ReplaySubmissionService,
    ) {
    }

    @MessagePattern(SubmissionEndpoint.CanSubmitReplays)
    async canSubmitReplays(@Payload() payload: unknown): Promise<ICanSubmitReplays_Response> {
        const data = SubmissionSchemas.CanSubmitReplays.input.parse(payload);
        return this.replaySubmissionUtilService.canSubmitReplays(data.submissionId, data.playerId);
    }

    @MessagePattern(SubmissionEndpoint.SubmitReplays)
    async submitReplays(@Payload() payload: unknown): Promise<string[]> {
        const data = SubmissionSchemas.SubmitReplays.input.parse(payload);
        return this.replaySubmissionService.beginSubmission(data.filepaths, data.submissionId, data.creatorId);
    }
}
