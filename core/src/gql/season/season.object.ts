import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { SeasonStatus } from '../../db/season/season.entity';

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
