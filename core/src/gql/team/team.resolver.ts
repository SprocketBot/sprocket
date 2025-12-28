import { Resolver, ResolveField, Root, Args, Query } from '@nestjs/graphql';
import { TeamObject } from './team.object';
import { TeamRepository } from '../../db/team/team.repository';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { TeamRoleObject } from './team-role.object';
import { RosterSpotObject } from './roster-spot.object';
import { ClubObject } from '../club/club.object';

@Resolver(() => TeamObject)
export class TeamResolver {
	constructor(private readonly teamRepo: TeamRepository) {}

	@Query(() => TeamObject)
	async team(@Args('id') id: string): Promise<TeamObject> {
		return this.teamRepo.findOneOrFail({
			where: { id }
		});
	}

	@Query(() => [TeamObject])
	async teams(): Promise<TeamObject[]> {
		return this.teamRepo.find();
	}

	@ResolveField(() => ClubObject)
	async club(@Root() root: Partial<TeamObject>) {
		if (root.club) return root.club;
		const team = await this.teamRepo.findOneByOrFail({ id: root.id });
		return await team.club;
	}

	@ResolveField(() => SkillGroupObject)
	async skillGroup(@Root() root: TeamObject) {
		if (root.skillGroup) return root.skillGroup;
		const team = await this.teamRepo.findOneOrFail({
			where: { id: root.id },
			relations: ['skillGroup'],
		});
		return team.skillGroup;
	}

	@ResolveField(() => [TeamRoleObject])
	async roles(@Root() root: TeamObject): Promise<TeamRoleObject[]> {
		if (root.roles) return root.roles;
		const team = await this.teamRepo.findOne({
			where: { id: root.id },
			relations: ['roles', 'roles.user'],
		});
		return (team?.roles as unknown as TeamRoleObject[]) ?? [];
	}

	@ResolveField(() => [RosterSpotObject])
	async rosterSpots(@Root() root: TeamObject): Promise<RosterSpotObject[]> {
		if (root.rosterSpots) return root.rosterSpots;
		const team = await this.teamRepo.findOne({
			where: { id: root.id },
			relations: ['rosterSpots', 'rosterSpots.player', 'rosterSpots.player.user'],
		});
		return (team?.rosterSpots as unknown as RosterSpotObject[]) ?? [];
	}
}
