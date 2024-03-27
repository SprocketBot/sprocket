import { Logger, Module } from '@nestjs/common';
import { GameEntitySeed } from './game/game.seed';
import { NestFactory } from '@nestjs/core';
import { DbModule } from './db.module';
import { BaseSprocketModules } from '@sprocketbot/lib';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type Seeder } from './seeder.decorator';
import { GameModeEntitySeed } from './game_mode/game_mode.seed';

@Module({
  imports: [DbModule, ...BaseSprocketModules],
  providers: [GameEntitySeed, GameModeEntitySeed],
})
class SeedModule {}

async function execSeeds() {
  const ctx = await NestFactory.createApplicationContext(SeedModule);

  const log = new Logger(execSeeds.name);

  const providers: Array<{ new (): any }> = Reflect.getMetadata(
    'providers',
    SeedModule,
  );

  const datasource: DataSource = ctx.get(getDataSourceToken());

  for (const provider of providers) {
    const isSeeder = Reflect.getMetadata('seeder', provider);
    if (!isSeeder) continue;

    const seeder: Seeder = ctx.get(provider);

    await datasource
      .transaction(async (em) => {
        await seeder.seed(em);
      })
      .then(() => log.log(`Executed ${provider.name}`))
      .catch((e) => {
        log.error(`Failed to execute ${provider.name}`, e);
        process.exit(1);
      });
  }

  await ctx.close();

  process.exit(0);
}

// @ts-expect-error Bun allows top level await
await execSeeds();
