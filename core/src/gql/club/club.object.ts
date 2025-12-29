import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { FranchiseObject } from '../franchise/franchise.object';
import type { FranchiseObject as FranchiseObjectType } from '../franchise/franchise.object';
import { GameObject } from '../game/game.object';
import type { GameObject as GameObjectType } from '../game/game.object';
import { TeamObject } from '../team/team.object';
import type { TeamObject as TeamObjectType } from '../team/team.object';
import { ClubRoleObject } from './club-role.object';
import type { ClubRoleObject as ClubRoleObjectType } from './club-role.object';

@ObjectType('Club')
export class ClubObject extends BaseObject {
	@Field(() => String)
	name: string;

	@Field(() => String)
	slug: string;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => FranchiseObject)
	franchise: FranchiseObjectType;

	@Field(() => GameObject)
	game: GameObjectType;

	@Field(() => [TeamObject])
	teams: TeamObjectType[];

	@Field(() => [ClubRoleObject])
	roles: ClubRoleObjectType[];
}
