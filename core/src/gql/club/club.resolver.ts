import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ClubObject } from './club.object';
import { ClubRepository } from '../../db/club/club.repository';

@Resolver(() => ClubObject)
export class ClubResolver {
	constructor(private readonly clubRepo: ClubRepository) {}
	@Query()
	async club(
		@Args('id') id: string,
		@Args('franchiseId') franchiseId?: string
	): Promise<ClubObject> {
		const club = await this.clubRepo.findOneBy({
			id,
			franchiseId
		});
		return club;
	}
}
