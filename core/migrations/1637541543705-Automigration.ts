import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1637541543705 implements MigrationInterface {
    name = 'Automigration1637541543705'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "public"."franchise" DROP CONSTRAINT "UQ_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "public"."franchise" DROP COLUMN "profileId"`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ADD "primaryColor" character varying NOT NULL DEFAULT '#F5C04E'`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ADD "secondaryColor" character varying NOT NULL DEFAULT '#0D0E0E'`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" ADD "logoUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" DROP COLUMN "logoUrl"`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" DROP COLUMN "secondaryColor"`);
        await queryRunner.query(`ALTER TABLE "public"."organization_profile" DROP COLUMN "primaryColor"`);
        await queryRunner.query(`ALTER TABLE "public"."franchise" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."franchise" ADD CONSTRAINT "UQ_35d150504cce7d58d2140713a3a" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "public"."franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
