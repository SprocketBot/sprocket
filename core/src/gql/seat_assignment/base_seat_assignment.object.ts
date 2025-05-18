import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseSeatAssignmentObject {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;
}
