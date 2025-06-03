import { Field, ObjectType } from '@nestjs/graphql';
import { TeamObject } from '../team/team.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { GameObject } from '../game/game.object';

@ObjectType('Club')
export class ClubObject {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updateAt: Date;

	// Field is implicit because of ResolveField
	franchise: FranchiseObject;
	@Field()
	franchiseId: string;

	// Field is implicit because of ResolveField
	game: GameObject;
	@Field()
	gameId: string;

	// Field is implicit because of ResolveField
	team: TeamObject[];
}
