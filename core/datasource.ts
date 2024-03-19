import { parse as yamlParse } from 'yaml';
import * as dotenv from 'dotenv';
import { env } from 'string-env-interpolation';
import { DataSource, MigrationInterface } from 'typeorm';

import { readFileSync, readdirSync } from 'fs';
import path from 'path';

// this file makes a primative CLI for running migrations; w/ Typescript
// Typeorm was not playing nicely with the glob pattern (even when using the noted loaders in the docs)

type MigrationConstructor = new () => MigrationInterface;

dotenv.config();
const configFile = env(readFileSync('./config.yaml', 'utf-8'));
const config = yamlParse(configFile);

const migrationsDir = `${__dirname}/migrations`;
const migrationModules = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((f) => f.isFile())
  .map((f) => path.join(migrationsDir, f.name))
  .map((f) => import(f));

const migrations: MigrationConstructor[] =
  // @ts-expect-error top level await is allowed in bun
  (await Promise.all(migrationModules))
    .map<MigrationConstructor[]>((mod) => Object.values(mod))
    .flat();

const datasource = new DataSource({
  type: 'postgres',
  host: config.pg.host,
  port: config.pg.port,
  username: config.pg.username,
  password: config.pg.password,
  database: config.pg.database,
  migrations: migrations,
  logging: 'all',
  entities: ['./src/db/**/*.entity.ts'],
});
export default datasource;

const commands = ['up', 'down', 'ls'];

if (commands.includes(process.argv[2])) {
  // @ts-expect-error top level await is allowed in bun
  await datasource.initialize();

  switch (process.argv[2]) {
    case 'up':
      // @ts-expect-error top level await is allowed in bun
      await datasource.runMigrations();
      break;
    case 'down':
      // @ts-expect-error top level await is allowed in bun
      await datasource.undoLastMigration();
      break;
    case 'ls':
      console.log(migrations.map((m) => m.name));
      break;
    default:
      console.log('Unknown command: ' + process.argv[2]);
      break;
  }
  // @ts-expect-error top level await is allowed in bun
  await datasource.destroy();
}
