import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1673203785610 implements MigrationInterface {
    name = 'Automigration1673203785610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_authentication_account" DROP CONSTRAINT "UserAccounts"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."user_authentication_account_accounttype_enum" RENAME TO "user_authentication_account_accounttype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."user_authentication_account_accounttype_enum" AS ENUM('DISCORD', 'GOOGLE', 'EPIC', 'STEAM', 'MICROSOFT', 'XBOX')`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ALTER COLUMN "accountType" TYPE "sprocket"."user_authentication_account_accounttype_enum" USING "accountType"::"text"::"sprocket"."user_authentication_account_accounttype_enum"`);
        await queryRunner.query(`DROP TYPE "sprocket"."user_authentication_account_accounttype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ADD CONSTRAINT "UserAccounts" UNIQUE ("accountId", "accountType")`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_authentication_account" DROP CONSTRAINT "UserAccounts"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."user_authentication_account_accounttype_enum_old" AS ENUM('DISCORD', 'GOOGLE', 'EPIC', 'STEAM')`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ALTER COLUMN "accountType" TYPE "sprocket"."user_authentication_account_accounttype_enum_old" USING "accountType"::"text"::"sprocket"."user_authentication_account_accounttype_enum_old"`);
        await queryRunner.query(`DROP TYPE "sprocket"."user_authentication_account_accounttype_enum"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."user_authentication_account_accounttype_enum_old" RENAME TO "user_authentication_account_accounttype_enum"`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ADD CONSTRAINT "UserAccounts" UNIQUE ("accountId", "accountType")`);
    }

}
