import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { ClubEntity, SkillGroupEntity, TeamEntity } from '../internal';

@Injectable()
@Seed()
export class TeamEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		const expressRocketLeagueClub = await em.findOneByOrFail(ClubEntity, {
			franchise: { name: 'Express' },
			game: { name: 'Rocket League' }
		});
		await seedTeam(expressRocketLeagueClub, 'Academy League');
		await seedTeam(expressRocketLeagueClub, 'Champion League');
		await seedTeam(expressRocketLeagueClub, 'Master League');
		await seedTeam(expressRocketLeagueClub, 'Premier League');

		async function seedTeam(club: ClubEntity, skillGroupName: string) {
			const skillGroup = await em.findOneOrFail(SkillGroupEntity, {
				where: { name: skillGroupName }
			});
			const team = await em.findOne(TeamEntity, {
				where: { club: { id: club.id }, skillGroup: { id: skillGroup.id } }
			});
			if (!team) {
				await em.insert(TeamEntity, {
					club: club,
					skillGroup: skillGroup
				});
			}
		}
	}
}
