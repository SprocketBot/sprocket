import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { TeamObject } from '../team/team.object';

@ObjectType('TeamSeatAssignment')
export class TeamSeatAssignmentObject {
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

  @Field(() => TeamObject, { nullable: true })
  team?: TeamObject;
}
