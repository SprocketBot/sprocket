import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {ICanSubmitReplays_Response} from "@sprocketbot/common";
import {SubmissionEndpoint, SubmissionSchemas} from "@sprocketbot/common";

import {ReplayUploadService} from "./replay-upload.service";

@Controller()
export class ReplayUploadController {
    constructor(private readonly replayUploadService: ReplayUploadService) {
    }

    @MessagePattern(SubmissionEndpoint.CanSubmitReplays)
    async canSubmitReplays(@Payload() payload: unknown): Promise<ICanSubmitReplays_Response> {
        const data = SubmissionSchemas.CanSubmitReplays.input.parse(payload);
        return this.replayUploadService.canSubmitReplays(data.submissionId, data.playerId);
    }
}
