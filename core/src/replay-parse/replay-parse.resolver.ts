import {
    Inject, UseGuards,
} from "@nestjs/common";
import {
    Args, Mutation, Resolver, Subscription,
} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {CurrentUser} from "../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "../identity/auth/oauth/types/userpayload.type";
import {ReplayParsePubSub} from "./replay-parse.constants";
import {ReplayParseService} from "./replay-parse.service";
import {ReplayParseProgress} from "./replay-parse.types";


@Resolver()
@UseGuards(GqlJwtGuard)
export class ReplayParseResolver {
    constructor(
        private readonly rpService: ReplayParseService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    @Mutation(() => [String])
    async parseReplays(
        @CurrentUser() user: UserPayload,
        @Args("files", {type: () => [GraphQLUpload]}) files: Array<Promise<FileUpload>>,
        @Args("submissionId", {nullable: true}) submissionId: string,
    ): Promise<string[]> {
        const streams = await Promise.all(files.map(async f => f.then(_f => _f.createReadStream())));
        return this.rpService.parseReplays(streams, submissionId, {id: user.userId, name: user.username});
    }

    @Subscription(() => ReplayParseProgress)
    async followReplayParse(@Args("submissionId") submissionId: string): Promise<AsyncIterator<ReplayParseProgress>> {
        this.rpService.followReplayParse(submissionId);
        return this.pubsub.asyncIterator(submissionId);
    }
}
