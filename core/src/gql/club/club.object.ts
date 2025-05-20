import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Club')
export class ClubObject {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;
}
