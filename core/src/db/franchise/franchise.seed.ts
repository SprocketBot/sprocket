import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { FranchiseEntity } from '../internal';

@Injectable()
@Seed()
export class FranchiseEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		await seedFranchise('Express');

		async function seedFranchise(franchiseName: string) {
			await em.upsert(
				FranchiseEntity,
				{
					name: franchiseName
				},
				{ conflictPaths: ['name'] }
			);
		}
	}
}
