import { Field, ObjectType } from '@nestjs/graphql';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { GameModeObject } from '../game_mode/game_mode.object';
import { BaseObject } from '../base.object';
import type { GameEntity } from '../../db/game/game.entity';

@ObjectType('Game')
export class GameObject extends BaseObject<GameEntity> {
  @Field()
  id: string;

  @Field()
  name: string;

  skillGroups: SkillGroupObject[];
  gameModes?: GameModeObject[];

  toEntity(): GameEntity {
    throw new Error();
  }
}
