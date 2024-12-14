import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { UserObject } from '../user/user.object';
import { GameObject } from '../game/game.object';
import { SkillGroupObject } from '../skill_group/skill_group.object';

@ObjectType('Player')
export class PlayerObject {
  @Field()
  id: string;

  // Field is implicit because of ResolveField
  user: UserObject;

  // Field is implicit because of ResolveField
  game: GameObject;

  // Field is implicit because of ResolveField
  skillGroup: SkillGroupObject;
}

@InputType()
export class CreatePlayerInput {
  @Field()
  userId: string;

  @Field()
  gameId: string;

  @Field()
  skillGroupId: string;
}

@InputType()
export class UpdatePlayerInput {
  @Field({ nullable: false })
  playerId: string;

  @Field({ nullable: true })
  destinationSkillGroupId: string;
}