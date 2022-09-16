import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1663308333261 implements MigrationInterface {
    name = 'Automigration1663308333261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "sprocket"."webhook_type_enum" AS ENUM('ScrimReportCard', 'MatchReportCard', 'SubmissionReadyForRatification', 'ScrimCreated')`);
        await queryRunner.query(`CREATE TABLE "webhook" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "webhookUrl" character varying NOT NULL, "type" "sprocket"."webhook_type_enum" NOT NULL, "webhookType" character varying NOT NULL, "franchiseId" integer, "skillGroupId" integer, CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ce3b5cfb8ee8d3ad01f174b8a4" ON "webhook" ("webhookType") `);
        await queryRunner.query(`ALTER TABLE "webhook" ADD CONSTRAINT "FK_62be2eb463f3f1306e816bb8636" FOREIGN KEY ("franchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webhook" ADD CONSTRAINT "FK_9be509843ae8b90d105b6a71061" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook" DROP CONSTRAINT "FK_9be509843ae8b90d105b6a71061"`);
        await queryRunner.query(`ALTER TABLE "webhook" DROP CONSTRAINT "FK_62be2eb463f3f1306e816bb8636"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_ce3b5cfb8ee8d3ad01f174b8a4"`);
        await queryRunner.query(`DROP TABLE "webhook"`);
        await queryRunner.query(`DROP TYPE "sprocket"."webhook_type_enum"`);
    }

}
