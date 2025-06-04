import { Resolver, ResolveField, Root, Args, Query } from '@nestjs/graphql';
import { TeamObject } from './team.object';
import { TeamRepository } from '../../db/team/team.repository';
import { SkillGroupObject } from '../skill_group/skill_group.object';

@Resolver(() => TeamObject)
export class TeamResolver {
	constructor(private readonly teamRepo: TeamRepository) {}

	@Query()
	async team(
		@Args('id') id: string,
		@Args('clubId') clubId?: string,
		@Args('skillGroupId') skillGroupId?: string
	): Promise<TeamObject> {
		const team = await this.teamRepo.findOne({
			where: {
				id: id,
				club: { id: clubId },
				skillGroup: { id: skillGroupId }
			}
		});
		return team;
	}

	@ResolveField()
	async club(@Root() root: Partial<TeamObject>) {
		if (root.club) return root.club;
		const team = await this.teamRepo.findOneByOrFail({ id: root.id });
		return await team.club;
	}

	@ResolveField(() => SkillGroupObject)
	async skillGroup(@Root() root: Partial<TeamObject>) {
		if (root.skillGroup) return root.skillGroup;
		const team = await this.teamRepo.findOneByOrFail({ id: root.id });
		return await team.skillGroup;
	}
}
