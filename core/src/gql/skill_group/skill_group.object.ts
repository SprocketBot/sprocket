import { Field, ObjectType } from '@nestjs/graphql';
import { GameObject } from '../game/game.object';

@ObjectType('SkillGroup')
export class SkillGroupObject {
	@Field()
	id: string;

	@Field()
	name: string;
	@Field()
	code: string;

	// Field is implicit because of ResolveField
	game: GameObject;
}
