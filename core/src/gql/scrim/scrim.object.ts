import { Field, ObjectType } from "@nestjs/graphql"
import type {Scrim} from "@sprocketbot/lib/types"

@ObjectType('Scrim')
export class ScrimObject implements Scrim {
  @Field(() => [String], {nullable: false})
  participants: string[];

  @Field({nullable: false})
  scrimId: string;
}
