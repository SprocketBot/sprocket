import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1630464043294 implements MigrationInterface {
    name = 'Automigration1630464043294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "user_authentication_account_accounttype_enum" AS ENUM('DISCORD')`);
        await queryRunner.query(`CREATE TABLE "user_authentication_account" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "accountId" character varying NOT NULL, "accountType" "user_authentication_account_accounttype_enum" NOT NULL, "userId" integer, CONSTRAINT "PK_bd8e58076a243f05dd2e7e1861b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ADD CONSTRAINT "FK_095432105c4860d594fd9545c47" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_authentication_account" DROP CONSTRAINT "FK_095432105c4860d594fd9545c47"`);
        await queryRunner.query(`DROP TABLE "user_authentication_account"`);
        await queryRunner.query(`DROP TYPE "user_authentication_account_accounttype_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
