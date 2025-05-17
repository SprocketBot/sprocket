import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { ClubSeatAssignmentObject } from './club_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { ClubObject } from '../club/club.object';

@Resolver(() => ClubSeatAssignmentObject)
export class ClubSeatAssignmentResolver {
  @ResolveField(() => SeatObject, { nullable: true })
  async seat(@Root() root: ClubSeatAssignmentObject): Promise<SeatObject | undefined> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => PlayerObject, { nullable: true })
  async player(@Root() root: ClubSeatAssignmentObject): Promise<PlayerObject | undefined> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => ClubObject, { nullable: true })
  async club(@Root() root: ClubSeatAssignmentObject): Promise<ClubObject | undefined> {
    throw new Error('Not yet implemented');
  }
}
