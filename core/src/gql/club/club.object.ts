import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { FranchiseObject } from '../franchise/franchise.object';
import { GameObject } from '../game/game.object';
import { TeamObject } from '../team/team.object';
import { ClubRoleObject } from './club-role.object';

@ObjectType('Club')
export class ClubObject extends BaseObject {
	@Field(() => String)
	name: string;

	@Field(() => String)
	slug: string;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => FranchiseObject)
	franchise: FranchiseObject;

	@Field(() => GameObject)
	game: GameObject;

	@Field(() => [TeamObject])
	teams: TeamObject[];

	@Field(() => [ClubRoleObject])
	roles: ClubRoleObject[];
}
