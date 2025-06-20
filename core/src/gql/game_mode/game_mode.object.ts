import { Field, ObjectType } from '@nestjs/graphql';
import { GameObject } from '../game/game.object';
import { BaseObject } from '../base.object';

@ObjectType('GameMode')
export class GameModeObject extends BaseObject {
	@Field()
	name: string;

	@Field()
	playerCount: number;

	@Field()
	teamSize: number;

	@Field()
	gameId: string;
  
	game?: GameObject;
}
