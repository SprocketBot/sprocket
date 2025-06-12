import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { GameEntity } from '../internal';

@Injectable()
@Seed()
export class GameEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		await seedGame('Rocket League');

		async function seedGame(gameName: string) {
			await em.upsert(
				GameEntity,
				{
					name: gameName
				},
				{ conflictPaths: ['name'] }
			);
		}
	}
}
