import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { SeatObject } from './seat.object';
import { RoleObject } from '../role/role.object';
import { SeatRepository } from '../../db/seat/seat.repository';

@Resolver(() => SeatObject)
export class SeatResolver {
	constructor(private readonly seatRepo: SeatRepository) {}

	@ResolveField(() => RoleObject)
	async role(@Root() root: Partial<SeatObject>) {
		if (root.role) return root.role;
		const seat = await this.seatRepo.findOneByOrFail({ id: root.id });
		return await seat.role;
	}
}
