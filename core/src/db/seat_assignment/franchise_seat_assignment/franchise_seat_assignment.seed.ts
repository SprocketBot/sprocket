import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../../seeder.decorator';
import { EntityManager } from 'typeorm';
import {
	FranchiseEntity,
	FranchiseSeatAssignmentEntity,
	SeatEntity,
	UserEntity
} from '../../internal';

@Injectable()
@Seed()
export class FranchiseSeatAssignmentEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		const expressFranchise = await em.findOneByOrFail(FranchiseEntity, {
			name: 'Express'
		});
		await seedFranchiseSeatAssignment(expressFranchise, 'Franchise Manager', '.hermod.');
		await seedFranchiseSeatAssignment(expressFranchise, 'Public Relations 1', 'ilikepie2151');
		await seedFranchiseSeatAssignment(expressFranchise, 'Public Relations 2', 'mattdamon');

		async function seedFranchiseSeatAssignment(
			franchise: FranchiseEntity,
			seatName: string,
			userName: string
		) {
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
				await em.insert(FranchiseSeatAssignmentEntity, {
					franchise: franchise,
					seat: franchiseSeat,
					user: franchiseUser
				});
			}
		}
	}
}
