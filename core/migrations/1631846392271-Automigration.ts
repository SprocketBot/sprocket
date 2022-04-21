import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1631846392271 implements MigrationInterface {
    name = 'Automigration1631846392271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."verbiage" ADD CONSTRAINT "organization code unique" UNIQUE ("organizationId", "codeId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."verbiage" DROP CONSTRAINT "organization code unique"`);
    }

}
