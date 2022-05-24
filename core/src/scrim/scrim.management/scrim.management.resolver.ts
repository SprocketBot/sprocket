import { Args, Query, Int } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { ScrimService } from '../scrim.service';
import { ScrimMetrics } from '../types';
import { Scrim as IScrim } from '../types';

@Resolver()
export class ScrimManagementResolver {
    constructor(
        private readonly scrimService: ScrimService,
    ) {}
    /*
        So, what we've got to do is straightforward. We create here a resolver
        that lets our bot team (scrim admins) perform the actions they already
        do on behalf of players for scrim management reasons:

        - Upload replays for a player/scrim
        - Force ratification of the scrim
        - Ban a player from queueing (and consequently unban them)
        - Ban a player from rejecting ratifications
        - Show/view all scrims in progress
        - Cancel a scrim
        - Change the state of a specific scrim

     */

    @Query(()=> ScrimMetrics)
    async getScrimMetrics(): Promise<ScrimMetrics> {
        return this.scrimService.getScrimMetrics();
    }

    @Query(()=> [IScrim])
    async getAllScrims(@Args('skillGroupId', {type: () => Int}) skillGroupId: number) {
        return this.scrimService.getAllScrims(skillGroupId);
    }
}
