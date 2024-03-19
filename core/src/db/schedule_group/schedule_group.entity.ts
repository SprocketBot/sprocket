import { BaseEntity } from '../base.entity';
import { Entity } from 'typeorm';

@Entity('schedule_group', { schema: 'sprocket' })
export class ScheduleGroupEntity extends BaseEntity {}
