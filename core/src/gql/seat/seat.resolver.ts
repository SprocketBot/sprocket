import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { SeatObject } from './seat.object';
import { RoleObject } from '../role/role.object';

@Resolver(() => SeatObject)
export class SeatResolver {
  @ResolveField(() => RoleObject, { nullable: true })
  async role(@Root() root: SeatObject): Promise<RoleObject | undefined> {
    throw new Error('Not yet implemented');
  }
}
