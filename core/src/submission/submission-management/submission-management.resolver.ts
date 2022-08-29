import {Query, Resolver} from "@nestjs/graphql";
import type {ReplaySubmission} from "@sprocketbot/common";

import {GqlReplaySubmission} from "../../replay-parse";
import {SubmissionService} from "../submission.service";

@Resolver()
export class SubmissionManagementResolver {
    constructor(private readonly submissionService: SubmissionService) {}

    @Query(() => [GqlReplaySubmission])
    async getActiveSubmissions(): Promise<ReplaySubmission[]> {
        return this.submissionService.getAllSubmissions();
    }
}
