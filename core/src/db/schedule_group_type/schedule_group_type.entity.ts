import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('schedule_group_type', { schema: 'sprocket' })
export class ScheduleGroupTypeEntity extends BaseEntity {}
