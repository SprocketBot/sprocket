import {Inject, UseGuards} from "@nestjs/common";
import {Args, Resolver, Subscription} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {PubSubKey} from "../../types/pubsub.constants";
import {GqlReplaySubmission} from "../replay-parse";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SubmissionSubscriber {
    constructor(@Inject(PubSubKey.Submissions) private readonly pubSub: PubSub) {}

    @Subscription(() => GqlReplaySubmission, {
        nullable: true,
        filter: async function (
            this: SubmissionSubscriber,
            payload: {followSubmission: {id: string}},
            variables: {submissionId: string},
        ): Promise<boolean> {
            return payload.followSubmission.id === variables.submissionId;
        },
    })
    async followSubmission(@Args("submissionId") submissionId: string): Promise<AsyncIterator<GqlReplaySubmission>> {
        return this.pubSub.asyncIterator(submissionId);
    }
}
