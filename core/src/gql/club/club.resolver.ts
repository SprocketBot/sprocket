import { Args, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { ClubObject } from './club.object';
import { ClubRepository } from '../../db/club/club.repository';
import { GameObject } from '../game/game.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { TeamObject } from '../team/team.object';

@Resolver(() => ClubObject)
export class ClubResolver {
	constructor(private readonly clubRepo: ClubRepository) {}

	@Query()
	async club(
		@Args('id') id: string,
		@Args('franchiseId') franchiseId: string,
		@Args('gameId') gameId: string
	): Promise<ClubObject> {
		const club = await this.clubRepo.findOne({
			where: {
				id: id,
				game: { id: gameId },
				franchise: { id: franchiseId }
			}
		});
		return club;
	}

	@ResolveField(() => FranchiseObject)
	async franchise(@Root() root: Partial<ClubObject>) {
		if (root.franchise) return root.franchise;
		const club = await this.clubRepo.findOneByOrFail({ id: root.id });
		return await club.franchise;
	}

	@ResolveField(() => GameObject)
	async game(@Root() root: Partial<ClubObject>) {
		if (root.game) return root.game;
		const club = await this.clubRepo.findOneByOrFail({ id: root.id });
		return await club.game;
	}

	@ResolveField(() => TeamObject)
	async teams(@Root() root: Partial<ClubObject>) {
		if (root.teams) return root.teams;
		const club = await this.clubRepo.findOneByOrFail({ id: root.id });
		return await club.teams;
	}
}
