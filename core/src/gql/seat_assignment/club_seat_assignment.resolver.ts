import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { ClubSeatAssignmentObject } from './club_seat_assignment.object';
import { ClubObject } from '../club/club.object';
import { BaseSeatAssignmentResolver } from './base_seat_assignment.resolver';

@Resolver(() => ClubSeatAssignmentObject)
export class ClubSeatAssignmentResolver extends BaseSeatAssignmentResolver {
	@ResolveField(() => ClubObject)
	async club(@Root() root: Partial<ClubSeatAssignmentObject>) {
		if (root.seat) return root.seat;
		const seatAssignment = await this.seatAssignmentRepo.findOneByOrFail({ id: root.id });
		return await seatAssignment.seat;
	}
}
