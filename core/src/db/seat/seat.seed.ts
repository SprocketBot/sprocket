import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { SeatEntity } from './seat.entity';
import { RoleEntity } from '../role/role.entity';

@Injectable()
@Seed()
export class SeatEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		const franchiseManagerRole = await em.findOneByOrFail(RoleEntity, {
			name: 'Franchise Manager'
		});
		if (franchiseManagerRole) {
			await em.upsert(
				SeatEntity,
				{
					name: 'Franchise Manager',
					description: 'The owner of the franchise',
					role: franchiseManagerRole
				},
				{ conflictPaths: ['name'] }
			);
		}
		const generalManagerRole = await em.findOneByOrFail(RoleEntity, {
			name: 'General Manager'
		});
		if (generalManagerRole) {
			await em.upsert(
				SeatEntity,
				{
					name: 'General Manager',
					description: 'The manager of the game for the club',
					role: generalManagerRole
				},
				{ conflictPaths: ['name'] }
			);
		}
		const assistantGeneralManagerRole = await em.findOneByOrFail(RoleEntity, {
			name: 'Assistant General Manager'
		});
		if (assistantGeneralManagerRole) {
			await em.upsert(
				SeatEntity,
				{
					name: 'Assistant General Manager 1',
					description: 'The assistant manager of the game for the club',
					role: assistantGeneralManagerRole
				},
				{ conflictPaths: ['name'] }
			);
			await em.upsert(
				SeatEntity,
				{
					name: 'Assistant General Manager 2',
					description: 'The assistant manager of the game for the club',
					role: assistantGeneralManagerRole
				},
				{ conflictPaths: ['name'] }
			);
		}
		const publicRelationsRole = await em.findOneByOrFail(RoleEntity, {
			name: 'Public Relations'
		});
		if (publicRelationsRole) {
			await em.upsert(
				SeatEntity,
				{
					name: 'Public Relations 1',
					description: 'In charge of PR for the franchise',
					role: publicRelationsRole
				},
				{ conflictPaths: ['name'] }
			);
			await em.upsert(
				SeatEntity,
				{
					name: 'Public Relations 2',
					description: 'In charge of PR for the franchise',
					role: publicRelationsRole
				},
				{ conflictPaths: ['name'] }
			);
		}
		const captainRole = await em.findOneByOrFail(RoleEntity, {
			name: 'Captain'
		});
		if (captainRole) {
			await em.upsert(
				SeatEntity,
				{
					name: 'Captain 1',
					description: 'In charge of scheduling matches',
					role: captainRole
				},
				{ conflictPaths: ['name'] }
			);
			await em.upsert(
				SeatEntity,
				{
					name: 'Captain 2',
					description: 'In charge of PR for the franchise',
					role: captainRole
				},
				{ conflictPaths: ['name'] }
			);
			await em.upsert(
				SeatEntity,
				{
					name: 'Captain 3',
					description: 'In charge of PR for the franchise',
					role: captainRole
				},
				{ conflictPaths: ['name'] }
			);
			await em.upsert(
				SeatEntity,
				{
					name: 'Captain 4',
					description: 'In charge of PR for the franchise',
					role: captainRole
				},
				{ conflictPaths: ['name'] }
			);
		}
	}
}
