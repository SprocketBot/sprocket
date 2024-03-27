import { Field, ObjectType } from '@nestjs/graphql';
import { UserObject } from '../user/user.object';

@ObjectType('Player')
export class PlayerObject {
  @Field()
  id: string;

  // Field is implicit because of ResolveField
  user: UserObject;
}
