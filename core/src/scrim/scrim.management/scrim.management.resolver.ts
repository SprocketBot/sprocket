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

    /*
        So, what we've got to do is straightforward. We create here a resolver
        that lets our bot team (scrim admins) perform the actions they already
        do on behalf of players for scrim management reasons:

        - Upload replays for a player/scrim - This flow already exists, has to
          plug in to the replay-parse service
            - See UploadReplays.mutation.ts in web, and the
              replay-parse.resolver.ts in replay service.
        - Ban a player from queueing (and consequently unban them) DONE [in member-restriction.resolver.ts]
        - Ban a player from rejecting ratifications DONE
        - Show/view all scrims in progress DONE
        - Cancel a scrim DONE
     */
    @Query(() => [Scrim])
    async getActiveScrims(@Args("skillGroupId", {
        type: () => Int, nullable: true, defaultValue: 0,
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
