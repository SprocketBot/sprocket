import { Resolver, ResolveField } from '@nestjs/graphql';
import { ClubSeatAssignmentObject } from './club_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { ClubObject } from '../club/club.object';

@Resolver(() => ClubSeatAssignmentObject)
export class ClubSeatAssignmentResolver {
  @ResolveField(() => SeatObject)
  async seat(): Promise<SeatObject> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => PlayerObject)
  async player(): Promise<PlayerObject> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => ClubObject)
  async club(): Promise<ClubObject> {
    throw new Error('Not yet implemented');
  }
}
