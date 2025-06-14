import { BaseEntity } from '../internal';
import { Entity } from 'typeorm';

@Entity('schedule_group', { schema: 'sprocket' })
export class ScheduleGroupEntity extends BaseEntity {}
