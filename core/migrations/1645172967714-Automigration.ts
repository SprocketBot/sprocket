import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1645172967714 implements MigrationInterface {
    name = 'Automigration1645172967714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_profile" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "userProfileId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD CONSTRAINT "UQ_2ffc8d3455097079866bfca4d47" UNIQUE ("userProfileId")`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" ADD "oauthToken" character varying`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" DROP CONSTRAINT "UserAccounts"`);
        await queryRunner.query(`ALTER TYPE "public"."user_authentication_account_accounttype_enum" RENAME TO "user_authentication_account_accounttype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_authentication_account_accounttype_enum" AS ENUM('DISCORD', 'GOOGLE')`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" ALTER COLUMN "accountType" TYPE "public"."user_authentication_account_accounttype_enum" USING "accountType"::"text"::"public"."user_authentication_account_accounttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_authentication_account_accounttype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" ADD CONSTRAINT "UserAccounts" UNIQUE ("accountId", "accountType")`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD CONSTRAINT "FK_2ffc8d3455097079866bfca4d47" FOREIGN KEY ("userProfileId") REFERENCES "user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" DROP CONSTRAINT "FK_2ffc8d3455097079866bfca4d47"`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" DROP CONSTRAINT "UserAccounts"`);
        await queryRunner.query(`CREATE TYPE "public"."user_authentication_account_accounttype_enum_old" AS ENUM('DISCORD')`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" ALTER COLUMN "accountType" TYPE "public"."user_authentication_account_accounttype_enum_old" USING "accountType"::"text"::"public"."user_authentication_account_accounttype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_authentication_account_accounttype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_authentication_account_accounttype_enum_old" RENAME TO "user_authentication_account_accounttype_enum"`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" ADD CONSTRAINT "UserAccounts" UNIQUE ("accountId", "accountType")`);
        await queryRunner.query(`ALTER TABLE "public"."user_authentication_account" DROP COLUMN "oauthToken"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP CONSTRAINT "UQ_2ffc8d3455097079866bfca4d47"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "userProfileId"`);
        await queryRunner.query(`DROP TABLE "user_profile"`);
    }

}
