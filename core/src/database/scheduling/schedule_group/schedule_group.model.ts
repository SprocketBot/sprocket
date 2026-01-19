import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseModel } from '../../base-model';
import { Game } from '../../game/game';
import { ScheduleFixture } from '../schedule_fixture/schedule_fixture.model';
import { ScheduleGroupType } from '../schedule_group_type/schedule_group_type.model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class ScheduleGroup extends BaseModel {
  @Column()
  @Field(() => Date)
  start: Date;

  @Column()
  @Field(() => Date)
  end: Date;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  description?: string;

  @ManyToOne(() => ScheduleGroupType)
  @Field(() => ScheduleGroupType)
  type: ScheduleGroupType;

  @ManyToOne(() => Game)
  @Field(() => Game)
  game: Game;

  @ManyToOne(() => ScheduleGroup)
  @Field(() => ScheduleGroup, { nullable: true })
  parentGroup: ScheduleGroup;

  @OneToMany(() => ScheduleGroup, sg => sg.parentGroup)
  @Field(() => [ScheduleGroup], { nullable: 'items' })
  childGroups: ScheduleGroup[];

  @OneToMany(() => ScheduleFixture, sf => sf.scheduleGroup)
  @Field(() => [ScheduleFixture])
  fixtures: ScheduleFixture[];
}
