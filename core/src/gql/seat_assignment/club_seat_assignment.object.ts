import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { ClubObject } from '../club/club.object';

@ObjectType('ClubSeatAssignment')
export class ClubSeatAssignmentObject {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;

  @Field(() => SeatObject, { nullable: true })
  seat?: SeatObject;

  @Field(() => PlayerObject, { nullable: true })
  player?: PlayerObject;

  @Field(() => ClubObject, { nullable: true })
  club?: ClubObject;
}
