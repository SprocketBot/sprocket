import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { BaseObject } from '../base.object';
import { FranchiseObject } from '../franchise/franchise.object';
import type { FranchiseObject as FranchiseObjectType } from '../franchise/franchise.object';
import { GameObject } from '../game/game.object';
import type { GameObject as GameObjectType } from '../game/game.object';
import { TeamObject } from '../team/team.object';
import type { TeamObject as TeamObjectType } from '../team/team.object';
import { ClubRoleObject } from './club-role.object';
import type { ClubRoleObject as ClubRoleObjectType } from './club-role.object';
import { PaginatedResponse, SortOrder } from '../shared/pagination.object';
import { FuzzyString } from '../shared/fuzzy-field.object';

@ObjectType('Club')
export class ClubObject extends BaseObject {
	@Field(() => String)
	name: string;

	@Field(() => String)
	slug: string;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => FranchiseObject)
	franchise: FranchiseObjectType;

	@Field(() => GameObject)
	game: GameObjectType;

	@Field(() => [TeamObject])
	teams: TeamObjectType[];

	@Field(() => [ClubRoleObject])
	roles: ClubRoleObjectType[];
}

@ObjectType()
export class PaginatedClubs extends PaginatedResponse(ClubObject) { }

@InputType()
export class ClubFilters {
	@Field(() => String, { nullable: true })
	id?: string;

	@Field(() => FuzzyString, { nullable: true })
	name?: FuzzyString;

	@Field(() => String, { nullable: true })
	slug?: string;

	@Field(() => Boolean, { nullable: true })
	isActive?: boolean;

	@Field(() => String, { nullable: true })
	franchiseId?: string;

	@Field(() => String, { nullable: true })
	gameId?: string;
}

@InputType()
export class ClubSort {
	@Field(() => SortOrder, { nullable: true })
	name?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	slug?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	createdAt?: SortOrder;
}

@InputType()
export class CreateClubInput {
	@Field(() => String)
	@IsString()
	name: string;

	@Field(() => String)
	@IsString()
	slug: string;

	@Field(() => String)
	@IsString()
	franchiseId: string;

	@Field(() => String)
	@IsString()
	gameId: string;
}

@InputType()
export class UpdateClubInput {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	name?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	slug?: string;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
