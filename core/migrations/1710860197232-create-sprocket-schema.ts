import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSprocketSchema1710860197232 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER ROLE CURRENT_USER SET search_path TO sprocket,public`)
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS sprocket`);
    } 

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS sprocket`);
    }

}
