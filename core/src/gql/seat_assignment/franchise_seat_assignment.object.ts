import { Field, ObjectType } from '@nestjs/graphql';
import { FranchiseObject } from '../franchise/franchise.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';

@ObjectType('FranchiseSeatAssignment')
export class FranchiseSeatAssignmentObject extends BaseSeatAssignmentObject {
	@Field(() => FranchiseObject)
	franchise: FranchiseObject;
}
