import {Inject} from "@nestjs/common";
import {
    Args, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {ReplayParsePubSub} from "../replay-parse.constants";
import {ReplaySubmissionService} from "../replay-submission";
import {SubmissionRejection} from "./SubmissionRejection.model";

@Resolver()
export class ReplayRejectionResolver {
    constructor(
        private readonly replaySubmissionService: ReplaySubmissionService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    @Query(() => [SubmissionRejection])
    async getSubmissionRejections(@Args("submissionId") submissionId: string): Promise<SubmissionRejection[]> {
        const rejections = await this.replaySubmissionService.getRejections(submissionId);
        return rejections.map(r => ({
            playerId: r.playerId,
            reason: r.reason,
        }));
    }

    @Subscription()
    async followSubmissionRejections(@Args("submissionId") submissionId: string): Promise<AsyncIterator<SubmissionRejection[]>> {
        return this.pubsub.asyncIterator(submissionId);
    }
}
