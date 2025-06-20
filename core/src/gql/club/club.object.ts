import { Field, ObjectType } from '@nestjs/graphql';
import { TeamObject } from '../team/team.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { GameObject } from '../game/game.object';
import { BaseObject } from '../base.object';

@ObjectType('Club')
export class ClubObject extends BaseObject {
	@Field() //to be implemented in resolver
	franchise: FranchiseObject;
	@Field()
	franchiseId: string;

	@Field() //to be implemented in resolver
	game: GameObject;
	@Field()
	gameId: string;

	@Field() //to be implemented in resolver
	teams: TeamObject[];
}
