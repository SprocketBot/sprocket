import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { OrganizationSeatAssignmentObject } from './organization_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { UserObject } from '../user/user.object';

@Resolver(() => OrganizationSeatAssignmentObject)
export class OrganizationSeatAssignmentResolver {
  @ResolveField(() => SeatObject, { nullable: true })
  async seat(@Root() root: OrganizationSeatAssignmentObject): Promise<SeatObject | undefined> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => UserObject, { nullable: true })
  async user(@Root() root: OrganizationSeatAssignmentObject): Promise<UserObject | undefined> {
    throw new Error('Not yet implemented');
  }
}
