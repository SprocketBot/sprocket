import { Field, ObjectType, registerEnumType, InputType, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsInt, Min, IsDate, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { BaseObject } from '../base.object';
import { SeasonStatus } from '../../db/season/season.entity';
import { PaginatedResponse, SortOrder } from '../shared/pagination.object';
import { FuzzyString } from '../shared/fuzzy-field.object';

registerEnumType(SeasonStatus, {
	name: 'SeasonStatus'
});

@ObjectType('Season')
export class SeasonObject extends BaseObject {
	@Field(() => String)
	name: string;

	@Field(() => String)
	slug: string;

	@Field(() => Date)
	startDate: Date;

	@Field(() => Date, { nullable: true })
	endDate?: Date;

	@Field(() => SeasonStatus)
	status: SeasonStatus;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => Boolean)
	isOffseason: boolean;
}

@ObjectType()
export class PaginatedSeasons extends PaginatedResponse(SeasonObject) { }

@InputType()
export class SeasonFilters {
	@Field(() => String, { nullable: true })
	id?: string;

	@Field(() => FuzzyString, { nullable: true })
	name?: FuzzyString;

	@Field(() => String, { nullable: true })
	slug?: string;

	@Field(() => SeasonStatus, { nullable: true })
	status?: SeasonStatus;

	@Field(() => Boolean, { nullable: true })
	isActive?: boolean;

	@Field(() => Boolean, { nullable: true })
	isOffseason?: boolean;
}

@InputType()
export class SeasonSort {
	@Field(() => SortOrder, { nullable: true })
	name?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	startDate?: SortOrder;

	@Field(() => SortOrder, { nullable: true })
	createdAt?: SortOrder;
}

@InputType()
export class CreateSeasonInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	name: string;

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	slug: string;

	@Field(() => Int)
	@IsInt()
	@Min(1)
	number: number;

	@Field(() => Date)
	@IsDate()
	startDate: Date;

	@Field(() => Date)
	@IsDate()
	endDate: Date;

	@Field(() => SeasonStatus, { defaultValue: SeasonStatus.UPCOMING })
	@IsEnum(SeasonStatus)
	status: SeasonStatus;

	@Field(() => Boolean, { defaultValue: false })
	@IsBoolean()
	isOffseason: boolean;
}

@InputType()
export class UpdateSeasonInput {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	slug?: string;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	@Min(1)
	number?: number;

	@Field(() => Date, { nullable: true })
	@IsOptional()
	@IsDate()
	startDate?: Date;

	@Field(() => Date, { nullable: true })
	@IsOptional()
	@IsDate()
	endDate?: Date;

	@Field(() => SeasonStatus, { nullable: true })
	@IsOptional()
	@IsEnum(SeasonStatus)
	status?: SeasonStatus;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	isOffseason?: boolean;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
