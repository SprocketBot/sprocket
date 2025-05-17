import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { TeamSeatAssignmentObject } from './team_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { PlayerObject } from '../player/player.object';
import { TeamObject } from '../team/team.object';

@Resolver(() => TeamSeatAssignmentObject)
export class TeamSeatAssignmentResolver {
  @ResolveField(() => SeatObject, { nullable: true })
  async seat(@Root() root: TeamSeatAssignmentObject): Promise<SeatObject | undefined> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => PlayerObject, { nullable: true })
  async player(@Root() root: TeamSeatAssignmentObject): Promise<PlayerObject | undefined> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => TeamObject, { nullable: true })
  async team(@Root() root: TeamSeatAssignmentObject): Promise<TeamObject | undefined> {
    throw new Error('Not yet implemented');
  }
}
