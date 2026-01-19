import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { BaseObject } from '../base.object';
import { ClubObject } from '../club/club.object';
import type { ClubObject as ClubObjectType } from '../club/club.object';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import type { SkillGroupObject as SkillGroupObjectType } from '../skill_group/skill_group.object';
import { TeamRoleObject } from './team-role.object';
import type { TeamRoleObject as TeamRoleObjectType } from './team-role.object';
import { RosterSpotObject } from './roster-spot.object';
import type { RosterSpotObject as RosterSpotObjectType } from './roster-spot.object';
import { PaginatedResponse, SortOrder } from '../shared/pagination.object';
import { FuzzyString } from '../shared/fuzzy-field.object';

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
	club: ClubObjectType;

	@Field(() => SkillGroupObject)
	skillGroup: SkillGroupObjectType;

	@Field(() => [TeamRoleObject])
	roles: TeamRoleObjectType[];

	@Field(() => [RosterSpotObject])
	rosterSpots: RosterSpotObjectType[];
}

@ObjectType()
export class PaginatedTeams extends PaginatedResponse(TeamObject) { }

@InputType()
export class TeamFilters {
	@Field(() => String, { nullable: true })
	id?: string;

	@Field(() => FuzzyString, { nullable: true })
	name?: FuzzyString;

	@Field(() => String, { nullable: true })
	slug?: string;

	@Field(() => Boolean, { nullable: true })
	isActive?: boolean;

	@Field(() => String, { nullable: true })
	clubId?: string;

	@Field(() => String, { nullable: true })
	skillGroupId?: string;
}

@InputType()
export class TeamSort {
	@Field(() => SortOrder, { nullable: true })
	name?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	slug?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	createdAt?: SortOrder;
}

@InputType()
export class CreateTeamInput {
	@Field(() => String)
	@IsString()
	name: string;

	@Field(() => String)
	@IsString()
	slug: string;

	@Field(() => Int)
	@IsInt()
	rosterSizeLimit: number;

	@Field(() => String)
	@IsString()
	clubId: string;

	@Field(() => String)
	@IsString()
	skillGroupId: string;
}

@InputType()
export class UpdateTeamInput {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	name?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	slug?: string;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	rosterSizeLimit?: number;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	clubId?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	skillGroupId?: string;
}
