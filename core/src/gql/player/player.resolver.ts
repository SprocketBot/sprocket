import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { PlayerObject } from './player.object';
import { UserObject } from '../user/user.object';

@Resolver(() => PlayerObject)
export class PlayerResolver {
  @ResolveField(() => UserObject)
  async user(@Root() root: Partial<PlayerObject>) {
    if (root.user) return root.user;
    throw new Error('I am the problem');
  }
}
