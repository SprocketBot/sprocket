import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1634686423120 implements MigrationInterface {
    name = 'Automigration1634686423120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."verbiage" DROP CONSTRAINT "organization code unique"`);
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" ADD "platformAccountId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" DROP CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3"`);
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" ALTER COLUMN "platformId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."verbiage" ADD CONSTRAINT "UQ_676fbd9092ca76fd1a362084d30" UNIQUE ("organizationId", "codeId")`);
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" ADD CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" DROP CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3"`);
        await queryRunner.query(`ALTER TABLE "public"."verbiage" DROP CONSTRAINT "UQ_676fbd9092ca76fd1a362084d30"`);
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" ALTER COLUMN "platformId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" ADD CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."member_platform_account" DROP COLUMN "platformAccountId"`);
        await queryRunner.query(`ALTER TABLE "public"."verbiage" ADD CONSTRAINT "organization code unique" UNIQUE ("organizationId", "codeId")`);
    }

}
