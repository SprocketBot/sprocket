import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { Member } from '$db/organization/member/member.model';
import { Photo } from '$db/organization/photo/photo.model';
import { Pronouns } from '$db/organization/pronouns/pronouns.model';

import { BaseModel } from '../../base-model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class MemberProfile extends BaseModel {
  @Column()
  @Field(() => String)
  name: string;

  @ManyToOne(() => Pronouns, { nullable: true })
  @JoinColumn()
  @Field(() => Pronouns, { nullable: true })
  pronouns?: Pronouns;

  @OneToOne(() => Photo, { nullable: true })
  @JoinColumn()
  @Field(() => Photo, { nullable: true })
  profilePicture?: Photo;

  @OneToOne(() => Member)
  @JoinColumn()
  @Field(() => Member)
  member: Member;
}
