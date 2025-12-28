import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { PlayerObject } from '../player/player.object';
import { TeamObject } from '../team/team.object';
import { UserObject } from '../user/user.object';
import { OfferStatus } from '../../db/roster_offer/roster_offer.entity';

registerEnumType(OfferStatus, {
	name: 'OfferStatus',
});

@ObjectType('RosterOffer')
export class RosterOfferObject extends BaseObject {
	@Field(() => TeamObject)
	team: TeamObject;

	@Field(() => PlayerObject)
	player: PlayerObject;

	@Field(() => OfferStatus)
	status: OfferStatus;

	@Field(() => UserObject)
	offeredBy: UserObject;

	@Field(() => Date)
	offeredAt: Date;

	@Field(() => String, { nullable: true })
	message: string;
}
