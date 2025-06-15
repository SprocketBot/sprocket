import { Field, ObjectType } from '@nestjs/graphql';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { GameModeObject } from '../game_mode/game_mode.object';
import { BaseObject } from '../base.object';

@ObjectType('Game')
export class GameObject extends BaseObject {
	@Field()
	name: string;

	skillGroups: SkillGroupObject[];
	gameModes?: GameModeObject[];
}
