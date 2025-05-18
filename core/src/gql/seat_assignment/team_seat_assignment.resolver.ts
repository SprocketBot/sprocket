import { Resolver, ResolveField } from '@nestjs/graphql';
import { TeamSeatAssignmentObject } from './team_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { TeamObject } from '../team/team.object';

@Resolver(() => TeamSeatAssignmentObject)
export class TeamSeatAssignmentResolver {
  @ResolveField(() => SeatObject)
  async seat(): Promise<SeatObject> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => PlayerObject)
  async player(): Promise<PlayerObject> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => TeamObject)
  async team(): Promise<TeamObject> {
    throw new Error('Not yet implemented');
  }
}
