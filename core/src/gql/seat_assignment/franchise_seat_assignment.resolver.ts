import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { FranchiseSeatAssignmentObject } from './franchise_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { FranchiseObject } from '../franchise/franchise.object';

@Resolver(() => FranchiseSeatAssignmentObject)
export class FranchiseSeatAssignmentResolver {
  @ResolveField(() => SeatObject, { nullable: true })
  async seat(@Root() root: FranchiseSeatAssignmentObject): Promise<SeatObject | undefined> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => PlayerObject, { nullable: true })
  async player(@Root() root: FranchiseSeatAssignmentObject): Promise<PlayerObject | undefined> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => FranchiseObject, { nullable: true })
  async franchise(@Root() root: FranchiseSeatAssignmentObject): Promise<FranchiseObject | undefined> {
    throw new Error('Not yet implemented');
  }
}
