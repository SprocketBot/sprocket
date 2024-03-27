import { Field, ObjectType } from '@nestjs/graphql';
import type { User } from '@sprocketbot/lib/types';
import { PlayerObject } from '../player/player.object';
import { UserAuthAccountObject } from '../user_auth_account/user_auth_account.object';

@ObjectType('User')
export class UserObject implements User {
  @Field()
  id: string;

  @Field({ nullable: false })
  username: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => [String], { defaultValue: [], nullable: false })
  allowedActions?: any[];

  @Field()
  active: boolean;

  @Field(() => [PlayerObject])
  players: PlayerObject[];

  accounts: UserAuthAccountObject[];
}
