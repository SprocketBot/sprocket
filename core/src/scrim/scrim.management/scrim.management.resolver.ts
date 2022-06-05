import {Inject} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import type {Scrim as IScrim} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ScrimPubSub} from "../constants";
import {ScrimService} from "../scrim.service";
import {Scrim, ScrimEvent} from "../types";

@Resolver()
export class ScrimManagementResolver {
    constructor(
        private readonly scrimService: ScrimService,
        @Inject(ScrimPubSub) private readonly pubSub: PubSub,
    ) {}

    @Query(() => [Scrim])
    async getActiveScrims(@Args("skillGroupId", {
        type: () => Int, nullable: true,
    }) skillGroupId: number): Promise<IScrim[]> {
        return this.scrimService.getAllScrims(skillGroupId);
    }

    @Mutation(() => Scrim)
    async cancelScrim(@Args("scrimId", {type: () => String}) scrimId: string): Promise<IScrim> {
        return this.scrimService.cancelScrim(scrimId);
    }

    @Subscription(() => ScrimEvent)
    async followActiveScrims(): Promise<AsyncIterator<ScrimEvent>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.allActiveScrimsSubTopic);
    }

}
