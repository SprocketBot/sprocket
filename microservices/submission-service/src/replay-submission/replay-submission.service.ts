import {Injectable} from "@nestjs/common";

import {ReplaySubmissionCrudService} from "./replay-submission-crud.service";

@Injectable()
export class ReplaySubmissionService {
    constructor(private readonly submissionCrudService: ReplaySubmissionCrudService) {}

    async isRatified(submissionId: string): Promise<boolean> {
        const submission = await this.submissionCrudService.getSubmission(submissionId);
        return submission.ratifiers.length >= submission.requiredRatifications;
    }
}
