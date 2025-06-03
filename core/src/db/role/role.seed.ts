import { Injectable } from '@nestjs/common';
import { Seed, type Seeder } from '../seeder.decorator';
import { EntityManager } from 'typeorm';
import { RoleEntity } from './role.entity';

@Injectable()
@Seed()
export class RoleEntitySeed implements Seeder {
	async seed(em: EntityManager) {
		await em.upsert(
			RoleEntity,
			{
				name: 'Franchise Manager'
			},
			{ conflictPaths: ['name'] }
		);
		await em.upsert(
			RoleEntity,
			{
				name: 'General Manager'
			},
			{ conflictPaths: ['name'] }
		);
		await em.upsert(
			RoleEntity,
			{
				name: 'Assistant General Manager'
			},
			{ conflictPaths: ['name'] }
		);
		await em.upsert(
			RoleEntity,
			{
				name: 'Captain'
			},
			{ conflictPaths: ['name'] }
		);
		await em.upsert(
			RoleEntity,
			{
				name: 'Public Relations'
			},
			{ conflictPaths: ['name'] }
		);
	}
}
