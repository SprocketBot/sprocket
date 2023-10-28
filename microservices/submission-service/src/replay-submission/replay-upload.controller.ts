import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CanRatifySubmissionResponse, ICanSubmitReplays_Response} from "@sprocketbot/common";
import {
    SubmissionEndpoint, SubmissionOutput, SubmissionSchemas,
} from "@sprocketbot/common";

import {getSubmissionKey} from "../utils";
import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionUtilService} from "./replay-submission-util.service";

@Controller()
export class ReplayUploadController {
    constructor(
        private readonly replaySubmissionUtilService: ReplaySubmissionUtilService,
        private readonly replaySubmissionService: ReplaySubmissionService,
    ) {
    }

    @MessagePattern(SubmissionEndpoint.CanSubmitReplays)
    async canSubmitReplays(@Payload() payload: unknown): Promise<ICanSubmitReplays_Response> {
        const data = SubmissionSchemas.CanSubmitReplays.input.parse(payload);
        return this.replaySubmissionUtilService.canSubmitReplays(data.submissionId, data.memberId);
    }

    @MessagePattern(SubmissionEndpoint.CanRatifySubmission)
    async canRatifySubmission(@Payload() payload: unknown): Promise<CanRatifySubmissionResponse> {
        const data = SubmissionSchemas.CanRatifySubmission.input.parse(payload);
        return this.replaySubmissionUtilService.canRatifySubmission(data.submissionId, data.memberId);
    }

    @MessagePattern(SubmissionEndpoint.SubmitReplays)
    async submitReplays(@Payload() payload: unknown): Promise<string[]> {
        const data = SubmissionSchemas.SubmitReplays.input.parse(payload);
        return this.replaySubmissionService.beginSubmission(data.filepaths, data.submissionId, data.creatorId);
    }

    @MessagePattern(SubmissionEndpoint.GetSubmissionRedisKey)
    getSubmissionRedisKey(@Payload() payload: unknown): SubmissionOutput<SubmissionEndpoint.GetSubmissionRedisKey> {
        const data = SubmissionSchemas.GetSubmissionRedisKey.input.parse(payload);
        return {
            redisKey: getSubmissionKey(data.submissionId),
        };
    }
}
