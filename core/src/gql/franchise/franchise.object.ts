import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Franchise')
export class FranchiseObject {
  @Field()
  franchiseId: number;

  @Field()
  franchiseName: string;
}
