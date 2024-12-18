import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../../base.object';
import type { ScheduleGroupTypeEntity } from '../../../db/schedule_group_type/schedule_group_type.entity';
import type { ScheduleGroupObject } from '../schedule_group/schedule_group.object';
import { ScheduleGroupTypeRepository } from '../../../db/schedule_group_type/schedule_group_type.repository';
import { FuzzyString } from '../../shared/fuzzy-field.object.js';


@ObjectType('ScheduleGroupType')
export class ScheduleGroupTypeObject extends BaseObject<ScheduleGroupTypeEntity> {
  constructor(repo: ScheduleGroupTypeRepository) {
    super();
    this.repo = repo;
  }

  @Field()
  name: string;

  groups: ScheduleGroupObject[];
}


@InputType('FindScheduleGroupTypesInput')
export class FindScheduleGroupTypesInput {
  @Field({ nullable: true })
  name?: FuzzyString;
}


@InputType('CreateScheduleGroupTypeInput')
export class CreateScheduleGroupTypeInput {
  @Field()
  name: string;
}