import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { UserObject } from '../user/user.object';
import { SeatObject } from '../seat/seat.object';

@InterfaceType()
@ObjectType({ isAbstract: true })
export abstract class BaseSeatAssignmentObject extends BaseObject {
	seat: SeatObject;

	user: UserObject;
}
