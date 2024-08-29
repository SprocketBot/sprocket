import { Field, InputType, ObjectType } from '@nestjs/graphql';
import type { User } from '@sprocketbot/lib/types';
import { PlayerObject } from '../player/player.object';
import { UserAuthAccountObject } from '../user_auth_account/user_auth_account.object';
import { FuzzyString } from '../shared/fuzzy-field.object';
import { BaseObject } from '../base.object';
import { UserEntity } from '../../db/user/user.entity';
@ObjectType('User')
export class UserObject extends BaseObject<UserEntity> implements User {
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

  toEntity(): UserEntity {
    throw new Error();
  }
}

@InputType()
export class FindUserInput {
  @Field({ nullable: true })
  id?: string;

  @Field(() => FuzzyString, { nullable: true })
  username?: FuzzyString;

  @Field({ nullable: true })
  active?: boolean;

  @Field({ nullable: true, defaultValue: 50 })
  limit: number;
}
