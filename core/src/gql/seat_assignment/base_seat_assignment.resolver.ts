import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { SeatObject } from '../seat/seat.object';
import { UserObject } from '../user/user.object';
import { BaseSeatAssignmentObject } from './base_seat_assignment.object';
import { Repository } from 'typeorm';
import { BaseSeatAssignmentEntity } from '../../db/seat_assignment/base_seat_assignment.entity';

@Resolver(() => BaseSeatAssignmentObject)
export abstract class BaseSeatAssignmentResolver {
	constructor(protected readonly seatAssignmentRepo: Repository<BaseSeatAssignmentEntity>) {}
	@ResolveField(() => SeatObject)
	async seat(@Root() root: Partial<BaseSeatAssignmentObject>) {
		if (root.seat) return root.seat;
		const seatAssignment = await this.seatAssignmentRepo.findOneByOrFail({ id: root.id });
		return await seatAssignment.seat;
	}

	@ResolveField(() => UserObject)
	async user(@Root() root: Partial<BaseSeatAssignmentObject>) {
		if (root.user) return root.user;
		const seatAssignment = await this.seatAssignmentRepo.findOneByOrFail({ id: root.id });
		return await seatAssignment.user;
	}
}
