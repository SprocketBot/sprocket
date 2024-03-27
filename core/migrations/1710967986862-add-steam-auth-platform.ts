import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSteamAuthPlatform1710967986862 implements MigrationInterface {
    name = 'AddSteamAuthPlatform1710967986862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" ADD "avatarUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "history"."user_auth_account_history" ADD "avatarUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" ADD CONSTRAINT "unique_auth_account" UNIQUE ("platform", "platformId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" DROP CONSTRAINT "unique_auth_account"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" DROP COLUMN "avatarUrl"`);
    }

}
