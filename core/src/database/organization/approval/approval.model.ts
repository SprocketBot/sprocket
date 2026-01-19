import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Member } from '$db/organization/member/member.model';

import { BaseModel } from '../../base-model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class Approval extends BaseModel {
  @Column()
  @Field(() => String)
  notes: string;

  @Column({ default: false })
  @Field(() => Boolean, { defaultValue: false })
  isApproved: boolean;

  @ManyToOne(() => Member, { nullable: true })
  @Field(() => Member, { nullable: true })
  approvedBy?: Member;
}
