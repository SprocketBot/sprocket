import { Field, ObjectType } from '@nestjs/graphql';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { ClubObject } from '../club/club.object';

@ObjectType('Team')
export class TeamObject {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updateAt: Date;

	club: ClubObject;
	@Field()
	clubId: string;

	skillGroup: SkillGroupObject;
	@Field()
	skillGroupId: string;
}
