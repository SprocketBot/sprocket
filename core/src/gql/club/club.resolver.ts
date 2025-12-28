import { Args, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { ClubObject } from './club.object';
import { ClubRepository } from '../../db/club/club.repository';
import { GameObject } from '../game/game.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { TeamObject } from '../team/team.object';
import { ClubRoleObject } from './club-role.object';

@Resolver(() => ClubObject)
export class ClubResolver {
	constructor(private readonly clubRepo: ClubRepository) {}

	@Query(() => ClubObject)
	async club(@Args('id') id: string): Promise<ClubObject> {
		return this.clubRepo.findOneOrFail({
			where: { id }
		});
	}

	@Query(() => [ClubObject])
	async clubs(): Promise<ClubObject[]> {
		return this.clubRepo.find();
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

	@ResolveField(() => [TeamObject])
	async teams(@Root() root: ClubObject) {
		if (root.teams) return root.teams;
		const club = await this.clubRepo.findOne({
			where: { id: root.id },
			relations: ['teams'],
		});
		return club?.teams ?? [];
	}

	@ResolveField(() => [ClubRoleObject])
	async roles(@Root() root: ClubObject): Promise<ClubRoleObject[]> {
		if (root.roles) return root.roles;
		const club = await this.clubRepo.findOne({
			where: { id: root.id },
			relations: ['roles', 'roles.user'],
		});
		return (club?.roles as unknown as ClubRoleObject[]) ?? [];
	}
}
