import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { UserObject } from '../user/user.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('OrganizationSeatAssignment')
export class OrganizationSeatAssignmentObject extends BaseSeatAssignmentObject {
  @Field(() => SeatObject)
  seat: SeatObject;

  @Field(() => UserObject)
  user: UserObject;
}
