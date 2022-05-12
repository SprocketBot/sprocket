import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652307001985 implements MigrationInterface {
    name = 'Automigration1652307001985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ADD "manualExpirationReason" character varying`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" DROP CONSTRAINT "FK_786f16d7c2ca47f5c10e7381293"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" DROP CONSTRAINT "UQ_786f16d7c2ca47f5c10e7381293"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ADD CONSTRAINT "FK_786f16d7c2ca47f5c10e7381293" FOREIGN KEY ("memberId") REFERENCES "sprocket"."member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" DROP CONSTRAINT "FK_786f16d7c2ca47f5c10e7381293"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ADD CONSTRAINT "UQ_786f16d7c2ca47f5c10e7381293" UNIQUE ("memberId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ADD CONSTRAINT "FK_786f16d7c2ca47f5c10e7381293" FOREIGN KEY ("memberId") REFERENCES "sprocket"."member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" DROP COLUMN "manualExpirationReason"`);
    }

}
