import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../../seeder.decorator';
import { EntityManager } from 'typeorm';
import { FranchiseEntity } from '../../franchise/franchise.entity';
import { FranchiseSeatAssignmentEntity } from './franchise_seat_assignment.entity';
import { SeatEntity } from '../../seat/seat.entity';
import { UserEntity } from '../../user/user.entity';

@Injectable()
@Seed()
export class FranchiseSeatAssignmentEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		seedFranchiseSeatAssignment('Express', 'Franchise Manager', '.hermod.');
		seedFranchiseSeatAssignment('Express', 'Public Relations 1', 'ilikepie2151');
		seedFranchiseSeatAssignment('Express', 'Public Relations 2', 'mattdamon');

		async function seedFranchiseSeatAssignment(
			franchiseName: string,
			seatName: string,
			userName: string
		) {
			const franchise = await em.findOneOrFail(FranchiseEntity, {
				where: { name: franchiseName }
			});
			const franchiseSeat = await em.findOneOrFail(SeatEntity, {
				where: { name: seatName }
			});
			const franchiseUser = await em.findOneOrFail(UserEntity, {
				where: { username: userName }
			});
			const franchiseSeatAssignment = await em.findOne(FranchiseSeatAssignmentEntity, {
				where: {
					franchise: { id: franchise.id },
					seat: { id: franchiseSeat.id },
					user: { id: franchiseUser.id }
				}
			});
			if (!franchiseSeatAssignment) {
				await em.insert(FranchiseSeatAssignmentEntity, franchiseSeatAssignment);
			}
		}
	}
}
