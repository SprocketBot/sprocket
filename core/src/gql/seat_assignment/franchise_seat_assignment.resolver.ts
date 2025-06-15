import { Resolver, ResolveField } from '@nestjs/graphql';
import { FranchiseSeatAssignmentObject } from './franchise_seat_assignment.object';
import { FranchiseObject } from '../franchise/franchise.object';

@Resolver(() => FranchiseSeatAssignmentObject)
export class FranchiseSeatAssignmentResolver {
	@ResolveField(() => FranchiseObject)
	async franchise(): Promise<FranchiseObject> {
		throw new Error('Not yet implemented');
	}
}
