import 'reflect-metadata';

import * as dotenv from 'dotenv';
import { env } from 'string-env-interpolation';
import { DataSource, MigrationInterface } from 'typeorm';
import { parse as yamlParse } from 'yaml';

import { readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
import PostgresAdapter from 'casbin-pg-adapter';
import { Query } from 'typeorm/driver/Query';
import camelcase from 'lodash.camelcase';
import * as fs from 'fs';

// this file makes a primative CLI for running migrations; w/ Typescript
// Typeorm was not playing nicely with the glob pattern (even when using the noted loaders in the docs)
type MigrationConstructor = new () => MigrationInterface;

dotenv.config();
const configFile = env(
  // @ts-expect-error bun supports top-level await
  await readFile(process.env.CFG_FILE ?? './config.yaml', 'utf-8'),
);
const config = yamlParse(configFile);

const migrationsDir = path.join(__dirname, '..', 'migrations');

const migrationModules = // @ts-expect-error bun supports top-level await
  (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => path.join(migrationsDir, f.name))
    .map((f) => import(f));

console.log('Loading migrations...');

// @ts-expect-error bun supports top-level await
const migrations: MigrationConstructor[] = (await Promise.all(migrationModules))
  .map<MigrationConstructor[]>((mod) => Object.values(mod))
  .flat();

console.log('Creating datasource...');

const entitiesDir = path.join(__dirname, 'db');
const entityModules = // @ts-expect-error bun supports top-level await
  (await readdir(entitiesDir, { withFileTypes: true, recursive: true }))
    .filter((f) => f.isFile() && f.name.endsWith('.entity.ts'))
    .map((f) => path.join(f.parentPath, f.name))
    .map((f) => import(f));

const entities = // @ts-expect-error bun supports top-level await
  // eslint-disable-next-line @typescript-eslint/ban-types
  (await Promise.all(entityModules)).flatMap<Function>((mod) =>
    Object.values(mod),
  );
console.log({ entities });

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
  applicationName: 'SprocketCoreDatasource',
  entities: entities,
});

export default datasource;

const commands = ['up', 'down', 'ls', 'test', 'generate'];
console.log('Checking CLI...');

if (commands.includes(process.argv[2])) {
  async function cmdline() {
    await datasource.initialize();
    console.log('Attempting to connect:', {
      host: config.pg.host,
      port: config.pg.port,
      username: config.pg.username,
      password: config.pg.password.replaceAll(/./g, '*'),
      database: config.pg.database,
    });

    console.log('Updating role to ensure default ownership is correct');

    await datasource.query(`
      SET ROLE "${config.pg.database}"
    `);

    switch (process.argv[2]) {
      case 'up':
        console.log('Creating casbin psql adapter to ensure tables exist');
        const pgAdapter = await PostgresAdapter.newAdapter({
          migrate: true,
          host: config.pg.host,
          user: config.pg.username,
          password: config.pg.password,
          port: config.pg.port,
          database: config.pg.database,
        });

        // const enforcer = await newEnforcer('auth/model.conf', pgAdapter);
        await pgAdapter.close();
        console.log('Created casbin psql adapter to ensure tables exist');

        await datasource.runMigrations();
        break;
      case 'down':
        await datasource.undoLastMigration();
        break;
      case 'generate':
        const stamp = new Date().getTime();
        const title = process.argv[3] ?? 'untitled-migration';
        const migrationPath = path.join(
          __dirname,
          '..',
          'migrations',
          `${stamp}-${title}.ts`,
        );
        const migrationName = camelcase(title) + stamp;
        const queries = await datasource.driver.createSchemaBuilder().log();
        const toQueryText = (q: Query) => {
          const escaped = q.query.replace(new RegExp('`', 'g'), '\\`');
          const params = q.parameters?.length
            ? `, ${JSON.stringify(q.parameters)}`
            : '';
          return [
            '        await queryRunner.query(`',
            escaped,
            '`',
            params,
            ');',
          ].join('');
        };
        const ups = queries.upQueries.map(toQueryText);
        const downs = queries.downQueries.map(toQueryText);
        if (!ups.length && !downs.length) {
          console.log('No schema changes detected');
          return;
        }
        const migrationFileContent = `
import { MigrationInterface, QueryRunner } from "typeorm";
export class ${migrationName} implements MigrationInterface {
  name = '${migrationName}'

  public async up (queryRunner: QueryRunner): Promise<void> {
${ups.join('\n')}
  }
  public async down (queryRunner: QueryRunner): Promise<void> {
${downs.join('\n')}
  }
}
        `.trim();
        await writeFile(migrationPath, migrationFileContent);
        break;
      case 'test':
        console.log(
          datasource.entityMetadatas.length
            ? 'Working!'
            : 'Entity Metadata Missing!!',
        );
        break;
      default:
        console.log('Unknown command: ' + process.argv[2]);
        break;
    }
  }
  cmdline()
    .then(() => console.log('Done!'))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => datasource.destroy());
}
