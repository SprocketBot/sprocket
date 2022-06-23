import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1655675959541 implements MigrationInterface {
    name = 'Automigration1655675959541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "scrimReportWebhookUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "matchReportWebhookUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD "scrimReportWebhookUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD "matchReportWebhookUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "matchReportWebhookUrl"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "scrimReportWebhookUrl"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "matchReportWebhookUrl"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "scrimReportWebhookUrl"`);
    }

}
