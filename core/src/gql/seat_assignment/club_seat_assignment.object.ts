import { Field, ObjectType } from '@nestjs/graphql';
import { ClubObject } from '../club/club.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('ClubSeatAssignment')
export class ClubSeatAssignmentObject extends BaseSeatAssignmentObject {
	@Field(() => ClubObject)
	club: ClubObject;
}
