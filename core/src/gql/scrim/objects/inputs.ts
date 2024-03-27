import { Field, InputType } from '@nestjs/graphql';
import type { CreateScrimPayload } from '@sprocketbot/matchmaking';

@InputType('CreateScrimInput')
export class CreateScrimInput
  implements Omit<CreateScrimPayload, 'authorId' | 'skillGroupId'>
{
  @Field(() => String)
  gameId: string;
}
