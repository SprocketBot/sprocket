import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { UserObject } from '../user/user.object';

@ObjectType('OrganizationSeatAssignment')
export class OrganizationSeatAssignmentObject {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;

  @Field(() => SeatObject, { nullable: true })
  seat?: SeatObject;

  @Field(() => UserObject, { nullable: true })
  user?: UserObject;
}
