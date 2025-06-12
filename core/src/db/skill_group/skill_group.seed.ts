import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { GameEntity, SkillGroupEntity } from '../internal';

@Injectable()
@Seed()
export class SkillGroupEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		const rocketLeagueGame = await em.findOneOrFail(GameEntity, {
			where: { name: 'Rocket League' }
		});

		await seedSkillGroup(rocketLeagueGame, 'Foundation League', 'FL');
		await seedSkillGroup(rocketLeagueGame, 'Academy League', 'AL');
		await seedSkillGroup(rocketLeagueGame, 'Champion League', 'CL');
		await seedSkillGroup(rocketLeagueGame, 'Master League', 'ML');
		await seedSkillGroup(rocketLeagueGame, 'Premier League', 'PL');
		async function seedSkillGroup(game: GameEntity, name: string, code: string) {
			await em.upsert(
				SkillGroupEntity,
				{
					name: name,
					code: code,
					game: { id: game.id }
				},
				{ conflictPaths: ['name', 'code', 'game'] }
			);
		}
	}
}
