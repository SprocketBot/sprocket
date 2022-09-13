import {
    Inject, UseGuards,
} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import {
    ResponseStatus, SubmissionEndpoint, SubmissionService,
} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {MLE_OrganizationTeam} from "../database/mledb";
import {CurrentUser, UserPayload} from "../identity";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../mledb/mledb-player/mle-organization-team.guard";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseService} from "./replay-parse.service";
import type {ReplaySubmission} from "./types";
import {GqlReplaySubmission} from "./types";
import type {ValidationResult} from "./types/validation-result.types";
import {ValidationResultUnion} from "./types/validation-result.types";

@Resolver()
@UseGuards(GqlJwtGuard)
export class ReplayParseModResolver {
    constructor(
        private readonly rpService: ReplayParseService,
        private readonly submissionService: SubmissionService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    @Query(() => GqlReplaySubmission, {nullable: true})
    async getSubmission(@Args("submissionId") submissionId: string): Promise<ReplaySubmission | null> {
        return this.rpService.getSubmission(submissionId);
    }

    @Mutation(() => [String])
    async parseReplays(
        @CurrentUser() user: UserPayload,
        @Args("files", {type: () => [GraphQLUpload]}) files: Array<Promise<FileUpload>>,
        @Args("submissionId", {nullable: true}) submissionId: string,
    ): Promise<string[]> {
        const streams = await Promise.all(files.map(async f => f.then(_f => ({
            stream: _f.createReadStream(),
            filename: _f.filename,
        }))));
        return this.rpService.parseReplays(streams, submissionId, {id: user.userId, name: user.username});
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async resetSubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        await this.rpService.resetBrokenReplays(submissionId, user.userId, true);
        return false;
    }

    @Mutation(() => Boolean, {nullable: true})
    async ratifySubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<void> {
        return this.rpService.ratifySubmission(submissionId, user.userId);
    }

    @Mutation(() => Boolean, {nullable: true})
    async rejectSubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
        @Args("reason") reason: string,
    ): Promise<void> {
        return this.rpService.rejectSubmissionByPlayer(submissionId, user.userId, reason);
    }

    @Mutation(() => ValidationResultUnion)
    async validateSubmission(@Args("submissionId") submissionId: string): Promise<ValidationResult> {
        const response = await this.submissionService.send(SubmissionEndpoint.ValidateSubmission, {submissionId});
        if (response.status === ResponseStatus.ERROR) {
            throw response.error;
        }
        return response.data;
    }

    @Subscription(() => GqlReplaySubmission, {nullable: true})
    async followSubmission(@Args("submissionId") submissionId: string): Promise<AsyncIterator<GqlReplaySubmission>> {
        await this.rpService.enableSubscription(submissionId);
        return this.pubsub.asyncIterator(submissionId);
    }

}
