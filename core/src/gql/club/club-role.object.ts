import { Field, ObjectType, registerEnumType, InputType } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';
import { BaseObject } from '../base.object';
import { UserObject } from '../user/user.object';
import { ClubRoleType } from '../../db/club_role/club_role.entity';

registerEnumType(ClubRoleType, {
	name: 'ClubRoleType',
});

@ObjectType('ClubRole')
export class ClubRoleObject extends BaseObject {
	@Field(() => UserObject)
	user: UserObject;

	@Field(() => ClubRoleType)
	roleType: ClubRoleType;

	@Field(() => Date)
	assignedAt: Date;

	@Field(() => Boolean)
	requiresApproval: boolean;
}

@InputType()
export class AssignClubRoleInput {
	@Field(() => String)
	@IsUUID()
	userId: string;

	@Field(() => String)
	@IsUUID()
	clubId: string;

	@Field(() => ClubRoleType)
	@IsEnum(ClubRoleType)
	roleType: ClubRoleType;
}
