import { ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { ScheduleGroupTypeEntity } from '../../db/schedule_group_type/schedule_group_type.entity';

@ObjectType('ScheduleGroupType')
export class ScheduleGroupTypeObject extends BaseObject {
    // Currently no additional fields in entity
}
