import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652145324212 implements MigrationInterface {
    name = 'Automigration1652145324212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "mledb"."player_account_platform_id_platform_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_account" DROP CONSTRAINT "UQ_305bd4ad5417289051b326e85d8"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_account" DROP CONSTRAINT "UQ_fb5d57725a7a7dd67308f6283a1"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_account" DROP CONSTRAINT "UQ_9d4152a98dffe1ed88d81befde8"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`CREATE UNIQUE INDEX "player_account_platform_id_platform_unique" ON "mledb"."player_account" ("platform", "platform_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "mledb"."player_account_platform_id_platform_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_account" ADD CONSTRAINT "UQ_9d4152a98dffe1ed88d81befde8" UNIQUE ("platform_id")`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_account" ADD CONSTRAINT "UQ_fb5d57725a7a7dd67308f6283a1" UNIQUE ("tracker")`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_account" ADD CONSTRAINT "UQ_305bd4ad5417289051b326e85d8" UNIQUE ("platform")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "player_account_platform_id_platform_unique" ON "mledb"."player_account" ("platform", "platform_id") `);
    }

}
