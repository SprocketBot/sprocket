import {Inject} from "@nestjs/common";
import {
    Args, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {ReplayParsePubSub} from "../replay-parse.constants";
import {ReplaySubmissionService} from "../replay-submission";
import {RatificationData} from "./RatificationData.model";

@Resolver()
export class ReplayRatificationResolver {
    constructor(
        private readonly replaySubmissionService: ReplaySubmissionService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {
    }

    @Query(() => RatificationData)
    async getSubmissionRatifications(@Args("submissionId") submissionId: string): Promise<RatificationData> {
        const submission = await this.replaySubmissionService.getSubmission(submissionId);
        return {
            currentRatifications: submission.ratifiers.length,
            requiredRatifications: submission.requiredRatifications,
        };
    }

    @Subscription(() => RatificationData)
    async followSubmissionRatifications(@Args("submissionId") submissionId: string): Promise<AsyncIterator<RatificationData>> {
        return this.pubsub.asyncIterator(submissionId);
    }
}
