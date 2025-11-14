import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  ScrimState,
  type Scrim,
  ScrimParticipant,
} from '../../matchmaking/connector/matchmaking.connector';
import { UserObject } from '../user/user.object';
import { GameObject } from '../game/game.object';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { GameModeObject } from '../game_mode/game_mode.object';

registerEnumType(ScrimState, { name: 'ScrimState' });

@ObjectType('ScrimParticipant')
export class ScrimParticipantObject implements ScrimParticipant {
  @Field()
  id: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  checkedIn: boolean;

  @Field(() => String)
  name?: string;
}
@ObjectType('Scrim')
export class ScrimObject implements Scrim {
  @Field(() => [ScrimParticipantObject], { nullable: true })
  participants: ScrimParticipantObject[];

  @Field(() => Int)
  participantCount: number;

  @Field()
  id: string;

  @Field()
  authorId: string;
  author?: UserObject;

  @Field()
  gameId: string;
  game?: GameObject;

  @Field()
  skillGroupId: string;
  skillGroup?: SkillGroupObject;

  @Field()
  gameModeId: string;
  gameMode?: GameModeObject;

  @Field()
  maxParticipants: number;

  @Field()
  state: ScrimState;

  @Field({ nullable: true })
  pendingTtl?: number;

  @Field()
  createdAt: Date;
}
