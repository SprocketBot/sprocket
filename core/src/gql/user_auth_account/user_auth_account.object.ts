import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { UserObject } from '../user/user.object';

registerEnumType(AuthPlatform, {
  name: 'AuthPlatform',
});

@ObjectType('UserAuthAccount')
export class UserAuthAccountObject {
  @Field(() => AuthPlatform)
  platform: AuthPlatform;

  @Field()
  platformId: string;

  @Field()
  platformName: string;

  user: UserObject;
  userId: string;
}
