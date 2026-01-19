import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import type {
    GetAllSubmissionsResponse, GetSubmissionIfExistsResponse, SubmissionOutput,
} from "@sprocketbot/common";
import { SubmissionEndpoint, SubmissionSchemas } from "@sprocketbot/common";

import { ReplaySubmissionCrudService } from "./replay-submission-crud.service";
import { SubmissionMigrationService } from "../submission-migration.service";

@Controller()
export class ReplaySubmissionCrudController {
    constructor(
        private readonly crudService: ReplaySubmissionCrudService,
        private readonly migrationService: SubmissionMigrationService,
    ) { }

    @MessagePattern("submission.migrate")
    async migrateSubmissions(): Promise<{ success: boolean; }> {
        await this.migrationService.migrateSubmissions();
        return { success: true };
    }

    @MessagePattern(SubmissionEndpoint.GetSubmissionIfExists)
    async getSubmissionIfExists(@Payload() payload: unknown): Promise<GetSubmissionIfExistsResponse> {
        const submissionId = SubmissionSchemas.GetSubmissionIfExists.input.parse(payload);
        const submission = await this.crudService.getSubmission(submissionId) ?? null;
        return { submission };
    }

    @MessagePattern(SubmissionEndpoint.GetAllSubmissions)
    async getAllSubmissions(@Payload() payload: unknown): Promise<GetAllSubmissionsResponse> {
        SubmissionSchemas.GetAllSubmissions.input.parse(payload);
        return this.crudService.getAllSubmissions();
    }

    @MessagePattern(SubmissionEndpoint.RemoveSubmission)
    async removeSubmission(@Payload() payload: unknown): Promise<SubmissionOutput<SubmissionEndpoint.RemoveSubmission>> {
        const data = SubmissionSchemas.RemoveSubmission.input.parse(payload);
        await this.crudService.removeSubmission(data.submissionId);
        return { removed: true };
    }

    @MessagePattern(SubmissionEndpoint.GetSubmissionRejections)
    async getSubmissionRejections(@Payload() payload: unknown): Promise<SubmissionOutput<SubmissionEndpoint.GetSubmissionRejections>> {
        const data = SubmissionSchemas.RemoveSubmission.input.parse(payload);
        const rejections = await this.crudService.getSubmissionRejections(data.submissionId);
        return rejections.map(r => r.playerId.toString());
    }
}
