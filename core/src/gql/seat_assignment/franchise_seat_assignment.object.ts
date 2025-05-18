import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('FranchiseSeatAssignment')
export class FranchiseSeatAssignmentObject extends BaseSeatAssignmentObject {
  @Field(() => SeatObject)
  seat?: SeatObject;

  @Field(() => PlayerObject)
  player?: PlayerObject;

  @Field(() => FranchiseObject)
  franchise?: FranchiseObject;
}
