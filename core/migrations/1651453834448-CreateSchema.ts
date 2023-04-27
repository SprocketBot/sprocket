import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateSchema1651453834448 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS mledb;`)
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS sprocket;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}