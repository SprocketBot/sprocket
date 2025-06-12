import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { RoleEntity, SeatEntity } from '../internal';

@Injectable()
@Seed()
export class SeatEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		await seedSeat('Franchise Manager', 'The owner of the franchise', 'Franchise Manager');
		await seedSeat('General Manager', 'The manager of the club', 'General Manager');
		await seedSeat(
			'Assistant General Manager 1',
			'An assistant manager of the club',
			'Assistant General Manager'
		);
		await seedSeat(
			'Assistant General Manager 2',
			'An assistant manager of the club',
			'Assistant General Manager'
		);
		await seedSeat(
			'Public Relations 1',
			'A public relations for the franchise',
			'Public Relations'
		);
		await seedSeat(
			'Public Relations 2',
			'A public relations for the franchise',
			'Public Relations'
		);
		await seedSeat('Captain 1', 'A captain of the club', 'Captain');
		await seedSeat('Captain 2', 'A captain of the club', 'Captain');
		await seedSeat('Captain 3', 'A captain of the club', 'Captain');
		await seedSeat('Captain 4', 'A captain of the club', 'Captain');

		async function seedSeat(seatName: string, description: string, roleName: string) {
			const role = await em.findOneByOrFail(RoleEntity, {
				name: roleName
			});
			await em.upsert(
				SeatEntity,
				{
					name: seatName,
					description: description,
					role: role
				},
				{ conflictPaths: ['name'] }
			);
		}
	}
}
