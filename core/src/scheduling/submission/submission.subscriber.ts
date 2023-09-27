import {Inject, UseGuards} from "@nestjs/common";
import {Args, Resolver, Subscription} from "@nestjs/graphql";
import {PubSub} from "graphql-subscriptions";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import {PubSubKey} from "../../types/pubsub.constants";
import {SubmissionObject} from "../graphql/submission/submission.object";

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SubmissionSubscriber {
    constructor(@Inject(PubSubKey.Submissions) private readonly pubSub: PubSub) {}

    @Subscription(() => SubmissionObject, {
        nullable: true,
        filter: async function (
            this: SubmissionSubscriber,
            payload: {followSubmission: {id: string}},
            variables: {submissionId: string},
        ): Promise<boolean> {
            return payload.followSubmission.id === variables.submissionId;
        },
    })
    async followSubmission(@Args("submissionId") submissionId: string): Promise<AsyncIterator<SubmissionObject>> {
        return this.pubSub.asyncIterator(submissionId);
    }
}
