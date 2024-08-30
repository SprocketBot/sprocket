import { MigrationInterface, QueryRunner } from 'typeorm';
import fs from 'fs/promises';
import {query} from "express";

export class CreateHistoryFunctions1709822323624 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const updateTable = await fs.readFile(
      `${__dirname}/sql/update_history_table.sql`,
      'utf-8',
    );
    const createTable = await fs.readFile(
      `${__dirname}/sql/create_history_table.sql`,
      'utf-8',
    );
    const removeTable = await fs.readFile(
      `${__dirname}/sql/remove_history_table.sql`,
      'utf-8',
    );

    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS history;');

    await queryRunner.query(updateTable);
    await queryRunner.query(createTable);
    await queryRunner.query(removeTable);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION update_history_table;`);
    await queryRunner.query(`DROP FUNCTION create_history_table;`);
    await queryRunner.query(`DROP FUNCTION remove_history_table;`);
  }
}
