import {UseGuards} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver,
} from "@nestjs/graphql";
import {GraphQLError} from "graphql";

import {CurrentUser} from "../../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "../../identity/auth/oauth/types/userpayload.type";
import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionStats} from "./types/submission-stats.types";

@Resolver()
@UseGuards(GqlJwtGuard)
export class ReplaySubmissionResolver {
    constructor(private readonly service: ReplaySubmissionService) {}

    @Query(() => ReplaySubmissionStats)
    async getSubmissionStats(@Args("submissionId") submissionId: string): Promise<ReplaySubmissionStats> {
        const submission = await this.service.getSubmission(submissionId);
        if (submission.stats) return submission.stats;
        throw new GraphQLError("Submission still processing");
    }

    @Mutation(() => Boolean)
    async ratifySubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        return this.service.ratifySubmission(submissionId, user.userId);
    }
}
