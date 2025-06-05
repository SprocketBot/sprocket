import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { FranchiseEntity } from './franchise.entity';

@Injectable()
@Seed()
export class FranchiseEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		seedFranchise('Express');

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
