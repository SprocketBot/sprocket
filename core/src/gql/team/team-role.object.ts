import { Field, ObjectType, registerEnumType, InputType } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';
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

@InputType()
export class AssignTeamRoleInput {
	@Field(() => String)
	@IsUUID()
	userId: string;

	@Field(() => String)
	@IsUUID()
	teamId: string;

	@Field(() => TeamRoleType)
	@IsEnum(TeamRoleType)
	roleType: TeamRoleType;
}
