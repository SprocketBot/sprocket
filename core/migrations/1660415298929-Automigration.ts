import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1660415298929 implements MigrationInterface {
    name = 'Automigration1660415298929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature" DROP COLUMN "code"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."feature_code_enum" AS ENUM('AUTO_SALARIES', 'AUTO_RANKOUTS')`);
        await queryRunner.query(`ALTER TABLE "feature" ADD "code" "sprocket"."feature_code_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature" DROP COLUMN "code"`);
        await queryRunner.query(`DROP TYPE "sprocket"."feature_code_enum"`);
        await queryRunner.query(`ALTER TABLE "feature" ADD "code" character varying NOT NULL`);
    }

}
