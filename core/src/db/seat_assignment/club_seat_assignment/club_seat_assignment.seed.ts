import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../../seeder.decorator';
import { EntityManager } from 'typeorm';
import { ClubSeatAssignmentEntity } from './club_seat_assignment.entity';
import { ClubEntity } from '../../club/club.entity';
import { SeatEntity } from '../../seat/seat.entity';
import { UserEntity } from '../../user/user.entity';

@Injectable()
@Seed()
export class ClubSeatAssignmentEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		seedClubSeatAssignment('Rocket League', 'Express', 'General Manager', 'mattdamon');
		seedClubSeatAssignment('Rocket League', 'Express', 'Assistant General Manager 1', 'c0p3x');
		seedClubSeatAssignment(
			'Rocket League',
			'Express',
			'Assistant General Manager 2',
			'gogurtyogurt'
		);
		seedClubSeatAssignment('Rocket League', 'Express', 'Captain 1', 'massimo.rl');
		seedClubSeatAssignment('Rocket League', 'Express', 'Captain 2', 'fatality_fc');
		seedClubSeatAssignment('Rocket League', 'Express', 'Captain 3', 'hobohoppy');
		seedClubSeatAssignment('Rocket League', 'Express', 'Captain 4', 'ouiiidsmoker');

		async function seedClubSeatAssignment(
			gameName: string,
			franchiseName: string,
			seatName: string,
			userName: string
		) {
			const club = await em.findOneOrFail(ClubEntity, {
				where: { franchise: { name: franchiseName }, game: { name: gameName } }
			});
			const clubSeat = await em.findOneOrFail(SeatEntity, {
				where: { name: seatName }
			});
			const clubUser = await em.findOneOrFail(UserEntity, {
				where: { username: userName }
			});
			const clubSeatAssignment = await em.findOne(ClubSeatAssignmentEntity, {
				where: {
					club: { id: club.id },
					seat: { id: clubSeat.id },
					user: { id: clubUser.id }
				}
			});
			if (!clubSeatAssignment) {
				await em.insert(ClubSeatAssignmentEntity, clubSeatAssignment);
			}
		}
	}
}
