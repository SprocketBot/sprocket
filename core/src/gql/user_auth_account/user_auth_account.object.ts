import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { UserObject } from '../user/user.object';
import { BaseObject } from '../base.object';
import type { UserAuthAccountEntity } from '../../db/user_auth_account/user_auth_account.entity';

registerEnumType(AuthPlatform, {
  name: 'AuthPlatform',
});

@ObjectType('UserAuthAccount')
export class UserAuthAccountObject extends BaseObject<UserAuthAccountEntity> {
  @Field(() => AuthPlatform)
  platform: AuthPlatform;

  @Field()
  platformId: string;

  @Field()
  platformName: string;

  @Field()
  avatarUrl: string;

  user: UserObject;
  userId: string;

  toEntity(): UserAuthAccountEntity {
    throw new Error();
  }
}
