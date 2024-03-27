import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSprocketSchema1710860197232 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS sprocket`);
        await queryRunner.query(`ALTER USER current_user SET search_path TO public,sprocket`)
        await queryRunner.query(`SET search_path TO public,sprocket`)
        
    } 

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS sprocket`);
    }

}
