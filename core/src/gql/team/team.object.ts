import { ObjectType } from '@nestjs/graphql';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { ClubObject } from '../club/club.object';
import { BaseObject } from '../base.object';

@ObjectType('Team')
export class TeamObject extends BaseObject {
	// Field is implicit because of ResolveField
	club: ClubObject;

	// Field is implicit because of ResolveField
	skillGroup: SkillGroupObject;
}
