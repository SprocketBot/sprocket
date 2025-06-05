import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { GameEntity } from '../game/game.entity';
import { EntityManager } from 'typeorm';
import { FranchiseEntity } from '../franchise/franchise.entity';
import { ClubEntity } from '../club/club.entity';
import { SkillGroupEntity } from '../skill_group/skill_group.entity';
import { TeamEntity } from './team.entity';

@Injectable()
@Seed()
export class TeamEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		seedTeam('Rocket League', 'Express', 'Academy League');
		seedTeam('Rocket League', 'Express', 'Champion League');
		seedTeam('Rocket League', 'Express', 'Master League');
		seedTeam('Rocket League', 'Express', 'Premier League');

		async function seedTeam(gameName: string, franchiseName: string, skillGroupName: string) {
			const game = await em.findOneOrFail(GameEntity, {
				where: { name: gameName }
			});

			const franchise = await em.findOneOrFail(FranchiseEntity, {
				where: { name: franchiseName }
			});

			const club = await em.findOneOrFail(ClubEntity, {
				where: {
					game: { id: game.id },
					franchise: { id: franchise.id }
				}
			});
			const skillGroup = await em.findOneOrFail(SkillGroupEntity, {
				where: { name: skillGroupName }
			});
			const team = await em.findOne(TeamEntity, {
				where: { club: { id: club.id }, skillGroup: { id: skillGroup.id } }
			});
			if (!team) {
				await em.insert(TeamEntity, team);
			}
		}
	}
}
