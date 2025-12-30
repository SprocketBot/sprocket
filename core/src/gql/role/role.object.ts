import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';

@ObjectType('LegacyRole')
export class RoleObject extends BaseObject {
  @Field()
  name: string;
}
