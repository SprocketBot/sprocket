import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { TeamObject } from '../team/team.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('TeamSeatAssignment')
export class TeamSeatAssignmentObject extends BaseSeatAssignmentObject {
  @Field(() => SeatObject)
  seat: SeatObject;

  @Field(() => PlayerObject)
  player: PlayerObject;

  @Field(() => TeamObject)
  team: TeamObject;
}
