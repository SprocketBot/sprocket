import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Role')
export class RoleObject {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;

  @Field()
  name: string;
}
