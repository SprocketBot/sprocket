import {Injectable} from "@nestjs/common";
import type {ReplaySubmission} from "@sprocketbot/common";
import {
    ResponseStatus, SubmissionEndpoint, SubmissionService as CommonSubmissionService,
} from "@sprocketbot/common";

@Injectable()
export class SubmissionService {
    constructor(private readonly commonService: CommonSubmissionService) {}

    async getAllSubmissions(): Promise<ReplaySubmission[]> {
        const result = await this.commonService.send(SubmissionEndpoint.GetAllSubmissions, {});

        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }

    async adminResetSubmission(submissionId: string): Promise<boolean> {
        const result = await this.commonService.send(SubmissionEndpoint.ResetSubmission, {
            submissionId: submissionId,
            override: true,
            playerId: "-1", // playerId is not used when `override=true`
        });
        
        if (result.status === ResponseStatus.SUCCESS) return result.data;
        throw result.error;
    }
}
