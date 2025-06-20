import { ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { UserObject } from '../user/user.object';
import { SeatObject } from '../seat/seat.object';

@ObjectType({ isAbstract: true })
export abstract class BaseSeatAssignmentObject extends BaseObject {
	seat: SeatObject;

	user: UserObject;
}
