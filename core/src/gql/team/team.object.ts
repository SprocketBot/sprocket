import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { ClubObject } from '../club/club.object';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { TeamRoleObject } from './team-role.object';
import { RosterSpotObject } from './roster-spot.object';

@ObjectType('Team')
export class TeamObject extends BaseObject {
	@Field(() => String)
	name: string;

	@Field(() => String)
	slug: string;

	@Field(() => Int)
	rosterSizeLimit: number;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => ClubObject)
	club: ClubObject;

	@Field(() => SkillGroupObject)
	skillGroup: SkillGroupObject;

	@Field(() => [TeamRoleObject])
	roles: TeamRoleObject[];

	@Field(() => [RosterSpotObject])
	rosterSpots: RosterSpotObject[];
}
