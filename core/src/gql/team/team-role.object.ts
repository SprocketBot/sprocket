import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { UserObject } from '../user/user.object';
import { TeamRoleType } from '../../db/team_role/team_role.entity';

registerEnumType(TeamRoleType, {
	name: 'TeamRoleType',
});

@ObjectType('TeamRole')
export class TeamRoleObject extends BaseObject {
	@Field(() => UserObject)
	user: UserObject;

	@Field(() => TeamRoleType)
	roleType: TeamRoleType;

	@Field(() => Date)
	assignedAt: Date;

	@Field(() => Boolean)
	requiresApproval: boolean;
}
