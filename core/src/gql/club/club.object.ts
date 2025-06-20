import { ObjectType } from '@nestjs/graphql';
import { TeamObject } from '../team/team.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { GameObject } from '../game/game.object';
import { BaseObject } from '../base.object';

@ObjectType('Club')
export class ClubObject extends BaseObject {
	// Field is implicit because of ResolveField
	franchise: FranchiseObject;

	// Field is implicit because of ResolveField
	game: GameObject;

	// Field is implicit because of ResolveField
	teams: TeamObject[];
}
