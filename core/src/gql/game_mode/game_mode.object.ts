import { Field, ObjectType } from '@nestjs/graphql';
import { GameObject } from '../game/game.object';
import { BaseObject } from '../base.object';
import { GameModeEntity } from '../../db/game_mode/game_mode.entity';

@ObjectType('GameMode')
export class GameModeObject extends BaseObject<GameModeEntity> {
  @Field()
  name: string;

  @Field()
  playerCount: number;

  @Field()
  teamSize: number;

  @Field()
  gameId: string;

  game?: GameObject;

  toEntity(): GameModeEntity {
    throw new Error();
  }
}
