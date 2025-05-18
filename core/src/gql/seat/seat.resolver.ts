import { Resolver, ResolveField } from '@nestjs/graphql';
import { SeatObject } from './seat.object';
import { RoleObject } from '../role/role.object';

@Resolver(() => SeatObject)
export class SeatResolver {
  @ResolveField(() => RoleObject)
  async role(): Promise<RoleObject | undefined> {
    throw new Error('Not yet implemented');
  }
}
