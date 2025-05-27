import { Resolver, ResolveField, Args, Query } from '@nestjs/graphql';
import { TeamObject } from './team.object';
import { TeamRepository } from '../../db/team/team.repository';

@Resolver(() => TeamObject)
export class TeamResolver {
	constructor(private readonly teamRepo: TeamRepository) {}
	@Query()
	async team(@Args('id') id: string, @Args('clubId') clubId?: string): Promise<TeamObject> {
		const team = await this.teamRepo.findOneBy({
			id,
			clubId
		});
		return team;
	}
}
