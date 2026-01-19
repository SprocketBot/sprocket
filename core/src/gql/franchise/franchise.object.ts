import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsUrl, IsHexColor } from 'class-validator';
import { BaseObject } from '../base.object';
import { ClubObject } from '../club/club.object';
import type { ClubObject as ClubObjectType } from '../club/club.object';
import { FranchiseRoleObject } from './franchise-role.object';
import type { FranchiseRoleObject as FranchiseRoleObjectType } from './franchise-role.object';
import { OffsetPagination, PaginatedResponse, SortOrder } from '../shared/pagination.object';
import { FuzzyString } from '../shared/fuzzy-field.object';

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

@ObjectType()
export class PaginatedFranchises extends PaginatedResponse(FranchiseObject) { }

@InputType()
export class FranchiseFilters {
	@Field(() => String, { nullable: true })
	id?: string;

	@Field(() => FuzzyString, { nullable: true })
	name?: FuzzyString;

	@Field(() => String, { nullable: true })
	slug?: string;

	@Field(() => Boolean, { nullable: true })
	isActive?: boolean;
}

@InputType()
export class FranchiseSort {
	@Field(() => SortOrder, { nullable: true })
	name?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	slug?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	createdAt?: SortOrder;
}

@InputType()
export class CreateFranchiseInput {
	@Field(() => String)
	@IsString()
	name: string;

	@Field(() => String)
	@IsString()
	slug: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	description?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsUrl()
	logoUrl?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsHexColor()
	primaryColor?: string;
}

@InputType()
export class UpdateFranchiseInput {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	name?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	slug?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	description?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsUrl()
	logoUrl?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsHexColor()
	primaryColor?: string;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
