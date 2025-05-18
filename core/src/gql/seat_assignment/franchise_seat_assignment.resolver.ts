import { Resolver, ResolveField } from '@nestjs/graphql';
import { FranchiseSeatAssignmentObject } from './franchise_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { FranchiseObject } from '../franchise/franchise.object';

@Resolver(() => FranchiseSeatAssignmentObject)
export class FranchiseSeatAssignmentResolver {
  @ResolveField(() => SeatObject)
  async seat(): Promise<SeatObject> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => PlayerObject)
  async player(): Promise<PlayerObject> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => FranchiseObject)
  async franchise(): Promise<FranchiseObject> {
    throw new Error('Not yet implemented');
  }
}
