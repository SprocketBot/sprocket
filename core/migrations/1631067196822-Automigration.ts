import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1631067196822 implements MigrationInterface {
    name = 'Automigration1631067196822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" ADD CONSTRAINT "UserAccounts" UNIQUE ("accountId", "accountType")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" DROP CONSTRAINT "UserAccounts"`);
    }

}
