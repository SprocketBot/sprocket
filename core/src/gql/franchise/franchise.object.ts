import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { ClubObject } from '../club/club.object';
import type { ClubObject as ClubObjectType } from '../club/club.object';
import { FranchiseRoleObject } from './franchise-role.object';
import type { FranchiseRoleObject as FranchiseRoleObjectType } from './franchise-role.object';

@ObjectType('Franchise')
export class FranchiseObject extends BaseObject {
	@Field(() => String)
	name: string;

	@Field(() => String)
	slug: string;

	@Field(() => String, { nullable: true })
	description?: string;

	@Field(() => String, { nullable: true })
	logoUrl?: string;

	@Field(() => String, { nullable: true })
	primaryColor?: string;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => [ClubObject])
	clubs: ClubObjectType[];

	@Field(() => [FranchiseRoleObject])
	roles: FranchiseRoleObjectType[];
}
