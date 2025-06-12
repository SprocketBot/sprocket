import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { RoleEntity } from '../internal';

@Injectable()
@Seed()
export class RoleEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		await seedRole('Franchise Manager');
		await seedRole('General Manager');
		await seedRole('Assistant General Manager');
		await seedRole('Captain');
		await seedRole('Public Relations');

		async function seedRole(roleName: string) {
			await em.upsert(
				RoleEntity,
				{
					name: roleName
				},
				{ conflictPaths: ['name'] }
			);
		}
	}
}
