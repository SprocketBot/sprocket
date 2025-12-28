import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { GameEntity, GameModeEntity } from '../internal';

@Injectable()
@Seed()
export class GameModeEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		const rocketLeagueGame = await em.findOneOrFail(GameEntity, {
			where: { name: 'Rocket League' }
		});
		await seedGameMode(rocketLeagueGame, 'Doubles', 4, 2);
		await seedGameMode(rocketLeagueGame, 'Standard', 6, 3);

		async function seedGameMode(
			game: GameEntity,
			gameModeName: string,
			playerCount: number,
			teamSize: number
		) {
			const gameMode = await em.findOneBy(GameModeEntity, {
				name: gameModeName,
				game: { name: game.name }
			});
			if (!gameMode) {
				await em.insert(GameModeEntity, {
					name: gameModeName,
					game: game as any,
					playerCount: playerCount,
					teamSize: teamSize
				});
			}
		}
	}
}
