import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseModel } from '../../base-model';
import { Member } from '../member/member.model';
import { MemberRestrictionType } from './member_restriction_type.enum';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class MemberRestriction extends BaseModel {
  @Column({
    type: 'enum',
    enum: MemberRestrictionType,
  })
  @Field(() => MemberRestrictionType)
  type: MemberRestrictionType;

  @Column()
  @Field(() => Date)
  expiration: Date;

  @Column()
  @Field()
  reason: string;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  manualExpiration?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  manualExpirationReason?: string;

  @Column({ default: false })
  @Field({ defaultValue: false })
  forgiven: boolean;

  @ManyToOne(() => Member, m => m.restrictions)
  @JoinColumn()
  @Field(() => Member)
  member: Member;

  @Column()
  @Field()
  memberId: number;
}
