import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlatformName1710948782704 implements MigrationInterface {
    name = 'AddPlatformName1710948782704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" ADD "platformName" character varying NOT NULL DEFAULT 'Account Name Unknown'`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" ALTER COLUMN "platformName" DROP DEFAULT;`)
        // Keep History table in sync
        await queryRunner.query(`ALTER TABLE "history"."user_auth_account_history" ADD "platformName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" DROP COLUMN "platformName"`);
    }

}
