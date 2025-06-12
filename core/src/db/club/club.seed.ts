import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { ClubEntity, GameEntity, FranchiseEntity } from '../internal';

@Injectable()
@Seed()
export class ClubEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		await seedClub('Rocket League', 'Express');

		async function seedClub(gameName: string, franchiseName: string) {
			const franchise = await em.findOneOrFail(FranchiseEntity, {
				where: { name: franchiseName }
			});
			const game = await em.findOneOrFail(GameEntity, {
				where: { name: gameName }
			});
			const club = await em.findOne(ClubEntity, {
				where: { franchise: { id: franchise.id }, game: { id: game.id } }
			});
			if (!club) {
				await em.insert(ClubEntity, {
					franchise: franchise,
					game: game
				});
			}
		}
	}
}
