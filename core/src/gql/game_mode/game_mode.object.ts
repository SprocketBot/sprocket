import { Field, ObjectType } from '@nestjs/graphql';
import { GameObject } from '../game/game.object';

@ObjectType('GameMode')
export class GameModeObject {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field()
	playerCount: number;

	@Field()
	teamSize: number;

	game?: GameObject;
}
