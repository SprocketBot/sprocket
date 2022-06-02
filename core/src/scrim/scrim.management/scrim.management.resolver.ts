import { Args, Query, Int, Mutation, Subscription } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { ScrimService } from '../scrim.service';
import { Scrim as IScrim, ScrimEvent } from '../types';
import { ScrimPubSub } from '../constants';
import { PubSub } from 'apollo-server-express';
import { Inject } from '@nestjs/common';

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
        - Force ratification of the scrim - Still waiting on this
          service/feature to hit dev
        - Ban a player from queueing (and consequently unban them) DONE [in member-restriction.resolver.ts]
        - Ban a player from rejecting ratifications DONE
        - Show/view all scrims in progress DONE
        - Cancel a scrim DONE
        - Change state of a specific scrim
            - i.e. locking a scrim
            - This one will require changes to the matchmaking microservice.
              Delaying for now because there's some design involved. 

     */
    @Query(()=> [IScrim])
    async getActiveScrims(@Args('skillGroupId', {type: () => Int, nullable: true, defaultValue: 0}) skillGroupId: number) {
        return this.scrimService.getAllScrims(skillGroupId);
    }

    @Mutation(()=> IScrim)
    async cancelScrim(@Args('scrimId', {type: ()=> String}) scrimId: string) {
        return this.scrimService.cancelScrim(scrimId);
    }

    @Subscription(() => ScrimEvent)
    async followActiveScrims(): Promise<AsyncIterator<ScrimEvent>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.allActiveScrimsSubTopic);
    }

}
