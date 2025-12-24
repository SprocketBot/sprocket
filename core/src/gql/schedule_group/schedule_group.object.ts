import { ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { ScheduleGroupEntity } from '../../db/schedule_group/schedule_group.entity';

@ObjectType('ScheduleGroup')
export class ScheduleGroupObject extends BaseObject {
    // Currently no additional fields in entity
}
