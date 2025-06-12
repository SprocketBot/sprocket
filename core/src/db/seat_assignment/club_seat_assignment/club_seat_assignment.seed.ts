import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../../seeder.decorator';
import { EntityManager } from 'typeorm';
import { ClubEntity, ClubSeatAssignmentEntity, SeatEntity, UserEntity } from '../../internal';

@Injectable()
@Seed()
export class ClubSeatAssignmentEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		const expressRocketLeagueClub = await em.findOneByOrFail(ClubEntity, {
			franchise: { name: 'Express' },
			game: { name: 'Rocket League' }
		});

		await seedClubSeatAssignment(expressRocketLeagueClub, 'General Manager', 'mattdamon');
		await seedClubSeatAssignment(expressRocketLeagueClub, 'Assistant General Manager 1', 'c0p3x');
		await seedClubSeatAssignment(
			expressRocketLeagueClub,
			'Assistant General Manager 2',
			'gogurtyogurt'
		);
		await seedClubSeatAssignment(expressRocketLeagueClub, 'Captain 1', 'massimo.rl');
		await seedClubSeatAssignment(expressRocketLeagueClub, 'Captain 2', 'fatality_fc');
		await seedClubSeatAssignment(expressRocketLeagueClub, 'Captain 3', 'hobohoppy');
		await seedClubSeatAssignment(expressRocketLeagueClub, 'Captain 4', 'ouiiidsmoker');

		async function seedClubSeatAssignment(club: ClubEntity, seatName: string, userName: string) {
			const clubUser = await em.findOneOrFail(UserEntity, {
				where: { username: userName }
			});
			const clubSeat = await em.findOneOrFail(SeatEntity, {
				where: { name: seatName }
			});
			const clubSeatAssignment = await em.findOne(ClubSeatAssignmentEntity, {
				where: {
					club: { id: club.id },
					seat: { name: clubSeat.name },
					user: { username: clubUser.username }
				}
			});
			if (!clubSeatAssignment) {
				await em.insert(ClubSeatAssignmentEntity, {
					club: club,
					seat: clubSeat,
					user: clubUser
				});
			}
		}
	}
}
