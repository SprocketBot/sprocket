import { Field, ObjectType, registerEnumType, InputType } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';
import { BaseObject } from '../base.object';
import { UserObject } from '../user/user.object';
import { FranchiseRoleType } from '../../db/franchise_role/franchise_role.entity';

registerEnumType(FranchiseRoleType, {
	name: 'FranchiseRoleType',
});

@ObjectType('FranchiseRole')
export class FranchiseRoleObject extends BaseObject {
	@Field(() => UserObject)
	user: UserObject;

	@Field(() => FranchiseRoleType)
	roleType: FranchiseRoleType;

	@Field(() => Date)
	assignedAt: Date;

	@Field(() => Boolean)
	requiresApproval: boolean;
}

@InputType()
export class AssignFranchiseRoleInput {
	@Field(() => String)
	@IsUUID()
	userId: string;

	@Field(() => String)
	@IsUUID()
	franchiseId: string;

	@Field(() => FranchiseRoleType)
	@IsEnum(FranchiseRoleType)
	roleType: FranchiseRoleType;
}
