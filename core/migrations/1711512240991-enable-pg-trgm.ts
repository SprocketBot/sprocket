import { MigrationInterface, QueryRunner } from "typeorm";

export class EnablePgTrgm1711512240991 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
