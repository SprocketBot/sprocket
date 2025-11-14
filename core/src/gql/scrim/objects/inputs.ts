import { Field, InputType } from '@nestjs/graphql';
import {
  type ListScrimsPayload,
  type CreateScrimOptions,
  type CreateScrimPayload,
  ScrimState,
  DestroyScrimPayload,
} from '../../../matchmaking/connector/matchmaking.connector';

@InputType('CreateScrimInputOptions')
export class CreateScrimInputOptions implements CreateScrimOptions {
  @Field(() => Number, {
    nullable: true,
    description: 'In Minutes',
    defaultValue: 20,
  })
  pendingTimeout: number;
}

@InputType('CreateScrimInput')
export class CreateScrimInput
  implements
  Omit<CreateScrimPayload, 'authorId' | 'skillGroupId' | 'maxParticipants'> {
  @Field(() => String)
  gameId: string;

  @Field(() => String)
  gameModeId: string;

  @Field(() => CreateScrimInputOptions, { nullable: true })
  options?: CreateScrimInputOptions;
}

@InputType('ListScrimsInput')
export class ListScrimsInput implements ListScrimsPayload {
  @Field({ nullable: true })
  gameId?: string;
  @Field({ nullable: true })
  skillGroupid?: string;
  @Field({ nullable: true })
  state?: ScrimState;
}
@InputType('DestroyScrimInput')
export class DestroyScrimInput implements DestroyScrimPayload {
  @Field()
  scrimId: string;
}
