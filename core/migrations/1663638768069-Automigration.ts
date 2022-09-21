import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1663638768069 implements MigrationInterface {
    name = 'Automigration1663638768069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "webhook" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "url" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP COLUMN "scrimReportWebhookUrl"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP COLUMN "matchReportWebhookUrl"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP COLUMN "scrimReportWebhookUrl"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP COLUMN "matchReportWebhookUrl"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD "submissionDiscordRoleId" character varying`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD "scrimReportCardWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD "matchReportCardWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD "submissionWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD "scrimDiscordRoleId" character varying`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD "scrimReportCardWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD "matchReportCardWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD "scrimWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD CONSTRAINT "FK_cc07ec55512c884175d0cea03b5" FOREIGN KEY ("scrimReportCardWebhookId") REFERENCES "webhook"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD CONSTRAINT "FK_597d788e9b1f5b6c5445f54dbfd" FOREIGN KEY ("matchReportCardWebhookId") REFERENCES "webhook"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD CONSTRAINT "FK_5f0725cc56b40c882ad163f464e" FOREIGN KEY ("submissionWebhookId") REFERENCES "webhook"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD CONSTRAINT "FK_966c2e90b04404409bb180e3ea9" FOREIGN KEY ("scrimReportCardWebhookId") REFERENCES "webhook"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD CONSTRAINT "FK_4a1c9f8ab36c38eb9ac0abe5ac6" FOREIGN KEY ("matchReportCardWebhookId") REFERENCES "webhook"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD CONSTRAINT "FK_7e6f62450ccc87f07b090a340bc" FOREIGN KEY ("scrimWebhookId") REFERENCES "webhook"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // <History>
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" ADD "submissionDiscordRoleId" character varying`);
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" ADD "scrimReportCardWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" ADD "matchReportCardWebhookId" integer`);
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" ADD "submissionWebhookId" integer`);
        // </History>
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // <History>
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" DROP COLUMN "submissionWebhookId"`);
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" DROP COLUMN "matchReportCardWebhookId"`);
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" DROP COLUMN "scrimReportCardWebhookId"`);
        await queryRunner.query(`ALTER TABLE "history"."franchise_profile_history" DROP COLUMN "submissionDiscordRoleId"`);
        // </History>

        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP CONSTRAINT "FK_7e6f62450ccc87f07b090a340bc"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP CONSTRAINT "FK_4a1c9f8ab36c38eb9ac0abe5ac6"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP CONSTRAINT "FK_966c2e90b04404409bb180e3ea9"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP CONSTRAINT "FK_5f0725cc56b40c882ad163f464e"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP CONSTRAINT "FK_597d788e9b1f5b6c5445f54dbfd"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP CONSTRAINT "FK_cc07ec55512c884175d0cea03b5"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ALTER COLUMN "skillGroupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP COLUMN "scrimWebhookId"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP COLUMN "matchReportCardWebhookId"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP COLUMN "scrimReportCardWebhookId"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP COLUMN "scrimDiscordRoleId"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP COLUMN "submissionWebhookId"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP COLUMN "matchReportCardWebhookId"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP COLUMN "scrimReportCardWebhookId"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP COLUMN "submissionDiscordRoleId"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD "matchReportWebhookUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD "scrimReportWebhookUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD "matchReportWebhookUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD "scrimReportWebhookUrl" character varying`);
        await queryRunner.query(`DROP TABLE "webhook"`);
    }

}
