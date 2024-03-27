import { ResolveField, Resolver, Root } from '@nestjs/graphql';
import { UserObject } from '../user/user.object';
import { UserAuthAccountObject } from './user_auth_account.object';

@Resolver(() => UserAuthAccountObject)
export class UserAuthAccountResolver {
  @ResolveField(() => UserObject)
  async user(@Root() root: UserAuthAccountObject): Promise<UserObject> {
    if (root.user) return root.user;
    throw new Error('Not yet implemented');
  }
}
