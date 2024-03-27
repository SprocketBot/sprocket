import { parse as yamlParse } from 'yaml';
import * as dotenv from 'dotenv';
import { env } from 'string-env-interpolation';
import { DataSource, MigrationInterface } from 'typeorm';

import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import PostgresAdapter from 'casbin-pg-adapter';

// this file makes a primative CLI for running migrations; w/ Typescript
// Typeorm was not playing nicely with the glob pattern (even when using the noted loaders in the docs)

type MigrationConstructor = new () => MigrationInterface;

dotenv.config();
const configFile = env(
  readFileSync(process.env.CFG_FILE ?? './config.yaml', 'utf-8'),
);
const config = yamlParse(configFile);

const migrationsDir = `${__dirname}/migrations`;
const migrationModules = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((f) => f.isFile())
  .map((f) => path.join(migrationsDir, f.name))
  .map((f) => import(f));

console.log('Loading migrations...');

const migrations: MigrationConstructor[] = (await Promise.all(migrationModules))
  .map<MigrationConstructor[]>((mod) => Object.values(mod))
  .flat();

console.log('Creating datasource...');

const datasource = new DataSource({
  type: 'postgres',
  host: config.pg.host,
  port: config.pg.port,
  username: config.pg.username,
  password: config.pg.password,
  database: config.pg.database,
  migrations: migrations,
  migrationsRun: false,
  synchronize: false,
  migrationsTableName: 'public.migrations',
  logging: 'all',
  entities: [`${import.meta.dirname}/src/db/**/*.entity.ts`],
});
export default datasource;

const commands = ['up', 'down', 'ls', 'test'];
console.log('Checking CLI...');

if (commands.includes(process.argv[2])) {
  console.log('Attempting to connect:', {
    host: config.pg.host,
    port: config.pg.port,
    username: config.pg.username,
    password: config.pg.password.replaceAll(/./g, '*'),
    database: config.pg.database,
  });

  await datasource.initialize();

  console.log('Updating role to ensure default ownership is correct');
  await datasource.query(`
    SET ROLE "${config.pg.database}"
  `);

  switch (process.argv[2]) {
    case 'up':
      console.log("Creating casbin psql adapter to ensure tables exist")
      const pgAdapter = await PostgresAdapter.newAdapter({
        migrate: true,
        host: config.pg.host,
        user: config.pg.username,
        password: config.pg.password,
        port: config.pg.port,
        database: config.pg.database,
      });

      // const enforcer = await newEnforcer('auth/model.conf', pgAdapter);
      await pgAdapter.close()
      console.log("Created casbin psql adapter to ensure tables exist")

      await datasource.runMigrations();
      break;
    case 'down':
      await datasource.undoLastMigration();
      break;
    case 'ls':
      console.log(migrations.map((m) => m.name));
      break;
    case 'test':
      console.log('Working!');
      break;
    default:
      console.log('Unknown command: ' + process.argv[2]);
      break;
  }
  await datasource.destroy();
}
