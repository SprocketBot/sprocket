import {
    Inject, UseGuards,
} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {CurrentUser, UserPayload} from "../identity";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseService} from "./replay-parse.service";
import type {ReplaySubmission} from "./types";
import {GqlReplaySubmission} from "./types";

@Resolver()
@UseGuards(GqlJwtGuard)
export class ReplayParseModResolver {
    constructor(
        private readonly rpService: ReplayParseService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    @Query(() => GqlReplaySubmission)
    async getSubmission(@Args("submissionId") submissionId: string): Promise<ReplaySubmission> {
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
    async resetSubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        await this.rpService.resetBrokenReplays(submissionId, user.userId);
        return false;
    }

    @Mutation(() => Boolean, {nullable: true})
    async ratifySubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<void> {
        return this.rpService.ratifySubmission(submissionId, user.userId.toString());
    }

    @Mutation(() => Boolean, {nullable: true})
    async rejectSubmission(
        @CurrentUser() user: UserPayload,
        @Args("submissionId") submissionId: string,
        @Args("reason") reason: string,
    ): Promise<void> {
        return this.rpService.rejectSubmission(submissionId, user.userId.toString(), reason);
    }

    @Subscription(() => GqlReplaySubmission, {nullable: true})
    async followSubmission(@Args("submissionId") submissionId: string): Promise<AsyncIterator<GqlReplaySubmission>> {
        await this.rpService.enableSubscription(submissionId);
        return this.pubsub.asyncIterator(submissionId);
    }
}
