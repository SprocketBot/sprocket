import { Resolver, ResolveField } from '@nestjs/graphql';
import { OrganizationSeatAssignmentObject } from './organization_seat_assignment.object';
import { SeatObject } from '../seat/seat.object';
import { UserObject } from '../user/user.object';

@Resolver(() => OrganizationSeatAssignmentObject)
export class OrganizationSeatAssignmentResolver {
  @ResolveField(() => SeatObject)
  async seat(): Promise<SeatObject> {
    throw new Error('Not yet implemented');
  }

  @ResolveField(() => UserObject)
  async user(): Promise<UserObject> {
    throw new Error('Not yet implemented');
  }
}
