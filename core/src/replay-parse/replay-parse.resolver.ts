import {
    Inject, UseGuards,
} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";
import {GraphQLError} from "graphql";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {CurrentUser} from "../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "../identity/auth/oauth/types/userpayload.type";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseService} from "./replay-parse.service";
import {ReplayParseSubscriber} from "./replay-parse.subscriber";
import {ReplayParseProgress} from "./replay-parse.types";
import {ReplaySubmissionService} from "./replay-submission";
import {ReplaySubmissionStats} from "./replay-submission/types/submission-stats.types";

@Resolver()
@UseGuards(GqlJwtGuard)
export class ReplayParseResolver {
    constructor(
        private readonly replaySubmissionService: ReplaySubmissionService,
        private readonly rpService: ReplayParseService,
        private readonly rpSubscriber: ReplayParseSubscriber,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    @Query(() => [ReplayParseProgress], {nullable: true})
    async getReplayParseProgress(@Args("submissionId") submissionId: string): Promise<ReplayParseProgress[] | null> {
        return this.rpSubscriber.peek(submissionId);
    }

    @Query(() => ReplaySubmissionStats)
    async getSubmissionStats(@Args("submissionId") submissionId: string): Promise<ReplaySubmissionStats> {
        const submission = await this.replaySubmissionService.getSubmission(submissionId);
        if (submission.stats) return submission.stats;
        throw new GraphQLError("Submission still processing");
    }

    @Query(() => [String])
    async getSubmissionTasks(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<String[]> {
        const submission = await this.replaySubmissionService.getSubmission(submissionId);

        return submission.items.map(i => i.taskId);
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
    async resetSubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        await this.rpService.resetBrokenReplays(submissionId, user.userId);
        return false;
    }

    @Mutation(() => Boolean)
    async ratifySubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        return this.replaySubmissionService.ratifySubmission(submissionId, user.userId);
    }

    @Subscription(() => [ReplayParseProgress], {nullable: true})
    async followReplayParse(@Args("submissionId") submissionId: string): Promise<AsyncIterator<ReplayParseProgress>> {
        return this.pubsub.asyncIterator(submissionId);
    }
}
