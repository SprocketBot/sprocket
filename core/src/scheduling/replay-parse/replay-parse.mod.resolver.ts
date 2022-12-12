import {Inject, UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, Resolver, Subscription} from "@nestjs/graphql";
import {RedisService, ResponseStatus, SubmissionEndpoint, SubmissionService} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {AuthenticatedUser} from "../../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {JwtAuthPayload} from "../../authentication/types";
import {MLE_OrganizationTeam} from "../../database/mledb";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {PubSubKey} from "../../types/pubsub.constants";
import {ScrimService} from "../scrim/scrim.service";
import {FinalizationSubscriber} from "./finalization";
import {ReplayParseService} from "./replay-parse.service";
import type {ReplaySubmission} from "./types";
import {GqlReplaySubmission, ReplaySubmissionType} from "./types";
import type {ValidationResult} from "./types/validation-result.types";
import {ValidationResultUnion} from "./types/validation-result.types";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class ReplayParseModResolver {
    constructor(
        private readonly rpService: ReplayParseService,
        private readonly submissionService: SubmissionService,
        private readonly finalizationSub: FinalizationSubscriber,
        private readonly redisService: RedisService,
        private readonly scrimService: ScrimService,
        @Inject(PubSubKey.ReplayParsing) private readonly pubsub: PubSub,
    ) {}

    @Query(() => GqlReplaySubmission, {nullable: true})
    async getSubmission(@Args("submissionId") submissionId: string): Promise<ReplaySubmission | null> {
        return this.rpService.getSubmission(submissionId);
    }

    @Mutation(() => [String])
    async parseReplays(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("files", {type: () => [GraphQLUpload]})
        files: Array<Promise<FileUpload>>,
        @Args("submissionId", {nullable: true}) submissionId: string,
    ): Promise<string[]> {
        const streams = await Promise.all(
            files.map(async f =>
                f.then(_f => ({
                    stream: _f.createReadStream(),
                    filename: _f.filename,
                })),
            ),
        );
        return this.rpService.parseReplays(streams, submissionId, user.userId);
    }

    @Mutation(() => Boolean)
    @UseGuards(MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async resetSubmission(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<boolean> {
        await this.rpService.resetBrokenReplays(submissionId, user.userId, true);
        return false;
    }

    @Mutation(() => Boolean)
    @UseGuards(MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async forceSubmissionSave(@Args("submissionId") submissionId: string): Promise<boolean> {
        const redisKey = await this.submissionService.send(SubmissionEndpoint.GetSubmissionRedisKey, {submissionId});
        if (redisKey.status === ResponseStatus.ERROR) throw redisKey.error;

        const submission: ReplaySubmission = await this.redisService.getJson(redisKey.data.redisKey);

        if (submission.type === ReplaySubmissionType.MATCH) {
            await this.finalizationSub.onMatchSubmissionComplete(submission, submissionId);
        } else {
            const scrim = await this.scrimService.getScrimBySubmissionId(submission.id);
            await this.finalizationSub.onScrimComplete(submission, submission.id, scrim!);
        }

        return true;
    }

    @Mutation(() => Boolean, {nullable: true})
    async ratifySubmission(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("submissionId") submissionId: string,
    ): Promise<void> {
        return this.rpService.ratifySubmission(submissionId, user.userId);
    }

    @Mutation(() => Boolean, {nullable: true})
    async rejectSubmission(
        @AuthenticatedUser() user: JwtAuthPayload,
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

    @Subscription(() => GqlReplaySubmission, {
        nullable: true,
        filter: async function (
            this: ReplayParseModResolver,
            payload: {followSubmission: {id: string}},
            variables: {submissionId: string},
        ): Promise<boolean> {
            return payload.followSubmission.id === variables.submissionId;
        },
    })
    async followSubmission(@Args("submissionId") submissionId: string): Promise<AsyncIterator<GqlReplaySubmission>> {
        await this.rpService.enableSubscription();
        return this.pubsub.asyncIterator(submissionId);
    }
}
