import {Inject} from "@nestjs/common";
import {
    Args,
    Query, ResolveField, Resolver, Subscription,
} from "@nestjs/graphql";
import {PubSub} from "apollo-server-express";

import {Period} from "../../util/types/period.enum";
import {ScrimPubSub} from "../constants";
import {ScrimService} from "../scrim.service";
import {ScrimMetaCrudService} from "../scrim-crud/scrim-crud.service";
import {ScrimMetrics} from "../types/ScrimMetrics";

@Resolver(() => ScrimMetrics)
export class ScrimMetricsResolver {
    constructor(
        private readonly scrimService: ScrimService,
        private readonly scrimCrudService: ScrimMetaCrudService,
        @Inject(ScrimPubSub) private readonly pubSub: PubSub,
    ) {
    }

    @Query(() => ScrimMetrics)
    async getScrimMetrics(): Promise<ScrimMetrics> {
        return this.scrimService.getScrimMetrics();
    }

    @Subscription(() => ScrimMetrics)
    async followScrimMetrics(): Promise<AsyncIterator<ScrimMetrics>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.metricsSubTopic);
    }

    @ResolveField()
    async completedScrims(@Args("period", {type: () => Period}) period: Period): Promise<number> {
        return this.scrimCrudService.getScrimCountInPreviousPeriod(period);
    }

    @ResolveField()
    async previousCompletedScrims(@Args("period", {type: () => Period}) period: Period): Promise<number> {
        return this.scrimCrudService.getScrimCountInPreviousPeriod(period, true);
    }

}
