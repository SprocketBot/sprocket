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

	// Field is implicit because of ResolveField
	club: ClubObject;

	// Field is implicit because of ResolveField
	skillGroup: SkillGroupObject;
}
