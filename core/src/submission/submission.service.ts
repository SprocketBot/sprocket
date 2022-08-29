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
}
