import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1640558556329 implements MigrationInterface {
    name = 'Automigration1640558556329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ADD "websiteUrl" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ALTER COLUMN "primaryColor" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ALTER COLUMN "secondaryColor" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ALTER COLUMN "secondaryColor" SET DEFAULT '#0D0E0E'`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ALTER COLUMN "primaryColor" SET DEFAULT '#F5C04E'`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" DROP COLUMN "websiteUrl"`);
    }

}
