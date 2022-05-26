import {UseGuards} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver,
} from "@nestjs/graphql";

import {CurrentUser} from "../../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "../../identity/auth/oauth/types/userpayload.type";
import {ReplaySubmissionService} from "./replay-submission.service";

@Resolver()
@UseGuards(GqlJwtGuard)
export class ReplaySubmissionResolver {
    constructor(private readonly service: ReplaySubmissionService) {}

    @Query(() => [String])
    async getSubmissionTasks(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<String[]> {
        const submission = await this.service.getSubmission(submissionId)

        return submission.taskIds
    }

    @Mutation(() => Boolean)
    async ratifySubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        return this.service.ratifySubmission(submissionId, user.userId);
    }
}
