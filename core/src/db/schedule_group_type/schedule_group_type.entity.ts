import { BaseEntity } from '../internal';
import { Entity } from 'typeorm';

@Entity('schedule_group_type', { schema: 'sprocket' })
export class ScheduleGroupTypeEntity extends BaseEntity {}
