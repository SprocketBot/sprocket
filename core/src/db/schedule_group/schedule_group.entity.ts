import { ScheduleGroupObject } from '../../gql/scheduling/schedule_group/schedule_group.object';
import { DataOnly } from '../../gql/types';
import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ScheduleGroupTypeEntity } from '../schedule_group_type/schedule_group_type.entity';

@Entity('schedule_group', { schema: 'sprocket' })
export class ScheduleGroupEntity extends BaseEntity<ScheduleGroupObject> {
  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column()
  name: string;

  @ManyToOne(() => ScheduleGroupEntity, (sge) => sge.children, {
    nullable: true,
  })
  parent?: ScheduleGroupEntity | Promise<ScheduleGroupEntity>;

  @Column({ nullable: true })
  parentId?: string;

  @OneToMany(() => ScheduleGroupEntity, (sge) => sge.parent)
  children: ScheduleGroupEntity[] | Promise<ScheduleGroupEntity[]>;

  @ManyToOne(() => ScheduleGroupTypeEntity, (sgte) => sgte.groups)
  type: ScheduleGroupTypeEntity | Promise<ScheduleGroupTypeEntity>;

  @Column()
  typeId: string;

  toObject(): DataOnly<ScheduleGroupObject> {
    throw new Error();
  }
}
