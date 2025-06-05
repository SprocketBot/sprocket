import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { GameEntity } from '../game/game.entity';
import { EntityManager } from 'typeorm';
import { GameModeEntity } from './game_mode.entity';

@Injectable()
@Seed()
export class GameModeEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		seedGameMode('Rocket League', 'Doubles', 4, 2);
		seedGameMode('Rocket League', 'Standard', 6, 3);

		async function seedGameMode(
			gameName: string,
			gameModeName: string,
			playerCount: number,
			teamSize: number
		) {
			const game = await em.findOneOrFail(GameEntity, {
				where: { name: gameName }
			});

			const gameMode = await em.findOneBy(GameModeEntity, {
				name: gameModeName,
				game: { id: game.id }
			});
			if (!gameMode) {
				await em.insert(GameModeEntity, {
					name: gameModeName,
					game: { id: game.id },
					playerCount: playerCount,
					teamSize: teamSize
				});
			}
		}
	}
}
