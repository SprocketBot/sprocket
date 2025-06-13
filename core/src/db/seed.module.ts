import { Logger, Module } from '@nestjs/common';
import {
	/*ClubEntitySeed,
	ClubSeatAssignmentEntitySeed,
	FranchiseEntitySeed,
	FranchiseSeatAssignmentEntitySeed,*/
	GameEntitySeed,
	GameModeEntitySeed,
	PolicySeed,
	/*RoleEntitySeed,
	SeatEntitySeed,*/
	SkillGroupEntitySeed
	/*TeamEntitySeed,
	UserEntitySeed*/
} from './internal';
import { NestFactory } from '@nestjs/core';
import { DbModule } from './db.module';
import { BaseSprocketModules, RedisModule } from '@sprocketbot/lib';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type Seeder } from './seeder.decorator';
import { authz } from 'src/authz.def';
@Module({
	imports: [DbModule, authz, ...BaseSprocketModules.filter((mod) => mod !== RedisModule)],
	providers: [
		/*UserEntitySeed,
		RoleEntitySeed,*/
		PolicySeed,
		//SeatEntitySeed,
		GameEntitySeed,
		SkillGroupEntitySeed,
		GameModeEntitySeed
		/*FranchiseEntitySeed,
		ClubEntitySeed,
		TeamEntitySeed,
		FranchiseSeatAssignmentEntitySeed,
		ClubSeatAssignmentEntitySeed*/
	]
})
class SeedModule {}

async function execSeeds() {
	process.env.PG_CACHE = 'false'; // never use the cache during seeding
	const ctx = await NestFactory.createApplicationContext(SeedModule);

	const log = new Logger(execSeeds.name);

	const datasource: DataSource = ctx.get(getDataSourceToken());

	const providers: Array<{ new (): any }> = Reflect.getMetadata('providers', SeedModule);

	for (const provider of providers) {
		const isSeeder = Reflect.getMetadata('seeder', provider);
		if (!isSeeder) continue;

		const seeder: Seeder = ctx.get(provider);
		const masterQueryRunner = datasource.createQueryRunner('master');

		await masterQueryRunner.connect();

		await masterQueryRunner.manager
			.transaction(async (em) => {
				log.log(`Beginning ${provider.name}`);
				await seeder.seed(em);
			})
			.then(() => {
				log.log(`Executed ${provider.name}`);
				masterQueryRunner.release();
			})
			.catch(async (e) => {
				log.error(`Failed to execute ${provider.name}`, e);
				await masterQueryRunner.release();
				await datasource.destroy();
				await ctx.close();
				process.exit(1);
			});
	}

	await ctx.close();

	process.exit(0);
}

// @ts-expect-error Bun allows top level await
await execSeeds();
