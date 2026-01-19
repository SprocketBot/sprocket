import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RosterService } from './roster.service';
import { RosterSpotObject } from '../team/roster-spot.object';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';
import { ResourceAction } from '@sprocketbot/lib/types';

@Resolver()
export class RosterResolver {
	constructor(private readonly rosterService: RosterService) { }

	@UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
	@Mutation(() => RosterSpotObject)
	async addPlayerToRoster(
		@Args('teamId') teamId: string,
		@Args('playerId') playerId: string,
	): Promise<RosterSpotObject> {
		const spot = await this.rosterService.addPlayerToRoster(teamId, playerId);
		return spot as unknown as RosterSpotObject;
	}
}
