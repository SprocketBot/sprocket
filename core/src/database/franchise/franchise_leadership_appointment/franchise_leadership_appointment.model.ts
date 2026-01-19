import { Field, ObjectType } from '@nestjs/graphql/dist/decorators';
import { Entity, ManyToOne } from 'typeorm';

import { FranchiseLeadershipSeat } from '../../authorization/franchise_leadership_seat';
import { BaseModel } from '../../base-model';
import { Member } from '../../organization/member';
import { Franchise } from '../franchise/franchise.model';

@Entity({ schema: 'sprocket' })
@ObjectType()
export class FranchiseLeadershipAppointment extends BaseModel {
  @ManyToOne(() => Franchise)
  @Field(() => Franchise)
  franchise: Franchise;

  @ManyToOne(() => Member)
  @Field(() => Member)
  member: Member;

  @ManyToOne(() => FranchiseLeadershipSeat)
  @Field(() => FranchiseLeadershipSeat)
  seat: FranchiseLeadershipSeat;
}
