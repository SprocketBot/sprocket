import {Inject} from "@nestjs/common";
import {
    Args, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {ScrimService} from "../../scrim";
import {ReplayParsePubSub} from "../replay-parse.constants";
import {ReplaySubmissionService} from "../replay-submission";
import {SubmissionRejection} from "./SubmissionRejection.model";

@Resolver(() => SubmissionRejection)
export class ReplayRejectionResolver {
    constructor(
        private readonly scrimService: ScrimService,
        private readonly replaySubmissionService: ReplaySubmissionService,
        @Inject(ReplayParsePubSub) private readonly pubsub: PubSub,
    ) {}

    @Query(() => [SubmissionRejection])
    async getSubmissionRejections(@Args("submissionId") submissionId: string): Promise<SubmissionRejection[]> {
        const scrim = await this.scrimService.getScrimBySubmissionId(submissionId);
        const rejections = await this.replaySubmissionService.getRejections(submissionId);

        const out = rejections.map(r => {
            const player = scrim?.players.find(p => p.id === r.playerId);

            return {
                playerName: player?.name ?? "Someone",
                reason: r.reason,
                rejectedAt: new Date(Date.parse(r.rejectedAt)),
            };
        });

        return out;
    }

    @Subscription(() => [SubmissionRejection])
    async followSubmissionRejections(@Args("submissionId") submissionId: string): Promise<AsyncIterator<SubmissionRejection[]>> {
        return this.pubsub.asyncIterator(submissionId);
    }
}
