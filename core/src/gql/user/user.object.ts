import { Field, ObjectType } from '@nestjs/graphql';
import type { User } from '@sprocketbot/lib/types';

@ObjectType('User')
export class UserObject implements User {
  @Field({ nullable: false })
  username: string;
  @Field({ nullable: true })
  avatarUrl?: string;
  @Field(() => [Boolean], { defaultValue: [], nullable: false })
  allowedActions?: any[];
}
