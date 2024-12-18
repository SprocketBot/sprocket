import { DataOnly } from '../../gql/types';
import { BaseEntity } from '../base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ScheduleGroupEntity } from '../schedule_group/schedule_group.entity';
import { ScheduleGroupTypeObject } from '../../gql/scheduling/schedule_group_type/schedule_group_type.object';

@Entity('schedule_group_type', { schema: 'sprocket' })
export class ScheduleGroupTypeEntity extends BaseEntity<ScheduleGroupTypeObject> {
  @Column()
  name: string;

  @OneToMany(() => ScheduleGroupEntity, (scheduleGroup) => scheduleGroup.type)
  groups: ScheduleGroupEntity[] | Promise<ScheduleGroupEntity[]>;

  toObject(): DataOnly<ScheduleGroupTypeObject> {
    return {
      ...this,
    };
  }
}
