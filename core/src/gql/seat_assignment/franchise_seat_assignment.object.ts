import { Field, ObjectType } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { FranchiseObject } from '../franchise/franchise.object';

@ObjectType('FranchiseSeatAssignment')
export class FranchiseSeatAssignmentObject {
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

  @Field(() => FranchiseObject, { nullable: true })
  franchise?: FranchiseObject;
}
