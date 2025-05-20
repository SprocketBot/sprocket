import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { ClubObject } from '../club/club.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('ClubSeatAssignment')
export class ClubSeatAssignmentObject extends BaseSeatAssignmentObject {
  @Field(() => SeatObject)
  seat: SeatObject;

  @Field(() => PlayerObject)
  player: PlayerObject;

  @Field(() => ClubObject)
  club: ClubObject;
}
