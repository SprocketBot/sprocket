import { InterfaceType, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { UserObject } from '../user/user.object';
import { SeatObject } from '../seat/seat.object';

@InterfaceType()
@ObjectType({ isAbstract: true })
export abstract class BaseSeatAssignmentObject extends BaseObject {
	// Field is implicit because of ResolveField
	seat: SeatObject;

	// Field is implicit because of ResolveField
	user: UserObject;
}
