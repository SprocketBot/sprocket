import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { SkillGroupEntity } from './skill_group.entity';
import { EntityManager } from 'typeorm';
import { GameEntity } from '../game/game.entity';

@Injectable()
@Seed()
export class SkillGroupEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		seedSkillGroup('Rocket League', 'Foundation League', 'FL');
		seedSkillGroup('Rocket League', 'Academy League', 'AL');
		seedSkillGroup('Rocket League', 'Champion League', 'CL');
		seedSkillGroup('Rocket League', 'Master League', 'ML');
		seedSkillGroup('Rocket League', 'Premier League', 'PL');
		async function seedSkillGroup(gameName: string, name: string, code: string) {
			const game = await em.findOneOrFail(GameEntity, {
				where: { name: gameName }
			});
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
