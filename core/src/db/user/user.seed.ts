import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
@Seed()
export class UserEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		await em.upsert(
			UserEntity,
			{
				username: '.hermod.',
				avatarUrl:
					'https://cdn.discordapp.com/avatars/232306757697798144/705c4231651c3bcfc929c8d9ce46bd08.png',
				active: true
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'mattdamon',
				active: true
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'c0p3x',
				active: false
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'gogurtyogurt',
				active: false
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'massimo.rl',
				active: true
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'fatality_fc',
				active: true
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'hobohoppy',
				active: true
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'ouiiidsmoker',
				active: true
			},
			{ conflictPaths: ['username'] }
		);
		await em.upsert(
			UserEntity,
			{
				username: 'ilikepie2151',
				active: true
			},
			{ conflictPaths: ['username'] }
		);
	}
}
