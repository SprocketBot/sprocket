import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {SubmissionOutput} from "@sprocketbot/common";
import {SubmissionEndpoint, SubmissionSchemas} from "@sprocketbot/common";

import {ReplaySubmissionCrudService} from "../replay-submission-crud.service";

@Controller()
export class ReplaySubmissionCrudController {
    constructor(private readonly crudService: ReplaySubmissionCrudService) {}

    @MessagePattern(SubmissionEndpoint.RemoveSubmission)
    async removeSubmission(@Payload() payload: unknown): Promise<SubmissionOutput<SubmissionEndpoint.RemoveSubmission>> {
        const data = SubmissionSchemas.RemoveSubmission.input.parse(payload);
        await this.crudService.removeSubmission(data.submissionId);
        return {removed: true};
    }

    @MessagePattern(SubmissionEndpoint.GetSubmissionRejections)
    async getSubmissionRejections(@Payload() payload: unknown): Promise<SubmissionOutput<SubmissionEndpoint.GetSubmissionRejections>> {
        const data = SubmissionSchemas.RemoveSubmission.input.parse(payload);
        const rejections = await this.crudService.getSubmissionRejections(data.submissionId);
        return rejections.map(r => r.playerId);
    }
}
