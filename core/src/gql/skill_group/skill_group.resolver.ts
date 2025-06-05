import { Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { SkillGroupRepository } from 'src/db/skill_group/skill_group.repository';
import { SkillGroupObject } from './skill_group.object';
import { UseGuards } from '@nestjs/common';
import { UsePermissions } from 'nest-authz';
import { AuthPossession, AuthZGuard } from 'nest-authz';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { ClubObject } from '../club/club.object';
import { GameObject } from '../game/game.object';

@Resolver()
export class SkillGroupResolver {
	constructor(private readonly skillGroupRepo: SkillGroupRepository) {}

	@UsePermissions({
		resource: Resource.SkillGroup,
		action: ResourceAction.Read,
		possession: AuthPossession.ANY
	})
	@UseGuards(AuthZGuard)
	@Query(() => [SkillGroupObject])
	async allSkillGroups() {
		return await this.skillGroupRepo.find();
	}

	@ResolveField(() => GameObject)
	async game(@Root() root: Partial<ClubObject>) {
		if (root.game) return root.game;
		const skillGroup = await this.skillGroupRepo.findOneByOrFail({ id: root.id });
		return await skillGroup.game;
	}
}
