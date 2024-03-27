import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { Scrim } from '@sprocketbot/lib/types';

@ObjectType('Scrim')
export class ScrimObject implements Scrim {
  @Field(() => [String], { nullable: true })
  participants: string[];

  @Field(() => [Int], { nullable: false })
  participantCount?: number;

  @Field({ nullable: false })
  scrimId: string;
}
