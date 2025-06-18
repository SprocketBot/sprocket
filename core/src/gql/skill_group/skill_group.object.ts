import { Field, ObjectType } from '@nestjs/graphql';
import { GameObject } from '../game/game.object';
import { BaseObject } from '../base.object';

@ObjectType('SkillGroup')
export class SkillGroupObject extends BaseObject {
	@Field()
	id: string;

	@Field()
	name: string;
	@Field()
	code: string;

	// Field is implicit because of ResolveField
	game: GameObject;
}
