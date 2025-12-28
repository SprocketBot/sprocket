import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RosterService } from './roster.service';
import { RosterSpotObject } from '../team/roster-spot.object';

@Resolver()
export class RosterResolver {
	constructor(private readonly rosterService: RosterService) {}

	@Mutation(() => RosterSpotObject)
	async addPlayerToRoster(
		@Args('teamId') teamId: string,
		@Args('playerId') playerId: string,
	): Promise<RosterSpotObject> {
		const spot = await this.rosterService.addPlayerToRoster(teamId, playerId);
		return spot as unknown as RosterSpotObject;
	}
}
