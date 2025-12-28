import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { PlayerObject } from '../player/player.object';
import { TeamObject } from '../team/team.object';
import { RosterStatus } from '../../db/roster_spot/roster_spot.entity';

registerEnumType(RosterStatus, {
	name: 'RosterStatus',
});

@ObjectType('RosterSpot')
export class RosterSpotObject extends BaseObject {
	@Field(() => TeamObject)
	team: TeamObject;

	@Field(() => PlayerObject)
	player: PlayerObject;

	@Field(() => RosterStatus)
	status: RosterStatus;

	@Field(() => Date)
	joinedAt: Date;

	@Field(() => Date, { nullable: true })
	leftAt: Date;
}
