import { Args, Query, Int, Mutation } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { ScrimService } from '../scrim.service';
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
        - Ban a player from queueing (and consequently unban them) DONE [in member-restriction.resolver.ts]
        - Ban a player from rejecting ratifications DONE
        - Show/view all scrims in progress DONE
        - Cancel a scrim DONE
        - Change the state of a specific scrim

     */
    @Query(()=> [IScrim])
    async getAllScrims(@Args('skillGroupId', {type: () => Int, nullable: true, defaultValue: 0}) skillGroupId: number) {
        return this.scrimService.getAllScrims(skillGroupId);
    }

    @Mutation(()=> IScrim)
    async cancelScrim(@Args('scrimId', {type: ()=> String}) scrimId: string) {
        return this.scrimService.cancelScrim(scrimId);
    }

}
