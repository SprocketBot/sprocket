import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Team')
export class TeamObject {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;
}
