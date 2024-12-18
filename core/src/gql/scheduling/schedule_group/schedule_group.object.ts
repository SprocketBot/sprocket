import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../../base.object';
import type { ScheduleGroupEntity } from '../../../db/schedule_group/schedule_group.entity';
import type { ScheduleGroupTypeObject } from '../schedule_group_type/schedule_group_type.object';
import { ScheduleGroupRepository } from '../../../db/schedule_group/schedule_group.repository';
import { FuzzyString } from '../../shared/fuzzy-field.object';

@ObjectType('ScheduleGroup')
export class ScheduleGroupObject extends BaseObject<ScheduleGroupEntity> {
  constructor(repo: ScheduleGroupRepository) {
    super();
    this.repo = repo;
  }
  @Field()
  start: Date;

  @Field()
  end: Date;

  @Field()
  name: string;

  // Implicitly defined as fields by resolver
  children?: ScheduleGroupObject[];
  parent?: ScheduleGroupObject;
  type: ScheduleGroupTypeObject;
}

@InputType('FindScheduleGroupsInput')
export class FindScheduleGroupsInput {
  @Field({ nullable: true })
  startAfter?: Date;
  @Field({ nullable: true })
  endBefore?: Date;
  @Field({ nullable: true })
  name?: FuzzyString;
}
