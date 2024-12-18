import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('OrgMetrics')
export class OrgMetricsObject {
  @Field()
  userCount: number;

  @Field()
  activeUserCount: number;

  @Field()
  playerCount: number;
}
