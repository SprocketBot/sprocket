import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
@Seed()
export class UserEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		seedUser(
			'.hermod.',
			true,
			'https://cdn.discordapp.com/avatars/232306757697798144/705c4231651c3bcfc929c8d9ce46bd08.png'
		);
		seedUser('mattdamon', true);
		seedUser('c0p3x', false);
		seedUser('gogurtyogurt', false);
		seedUser('massimo.rl', true);
		seedUser('fatality_fc', true);
		seedUser('hobohoppy', true);
		seedUser('ouiiidsmoker', true);
		seedUser('ilikepie2151', true);
		async function seedUser(username: string, active: boolean, avatarUrl?: string) {
			await em.upsert(
				UserEntity,
				{
					username: username,
					avatarUrl: avatarUrl,
					active: active
				},
				{ conflictPaths: ['username'] }
			);
		}
	}
}
