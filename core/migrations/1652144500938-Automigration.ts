import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652144500938 implements MigrationInterface {
    name = 'Automigration1652144500938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series" DROP CONSTRAINT "FK_2818d2ef39569bcc3b7f1249f4f"`);
        await queryRunner.query(`DROP INDEX "mledb"."series_league_fixture_id_mode_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."series" DROP CONSTRAINT "UQ_baca13734353fed4536e63968bf"`);
        await queryRunner.query(`ALTER TABLE "mledb"."series" DROP CONSTRAINT "UQ_371dd8db459a94526009ee4d830"`);
        await queryRunner.query(`ALTER TABLE "mledb"."series" DROP CONSTRAINT "UQ_2818d2ef39569bcc3b7f1249f4f"`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`CREATE UNIQUE INDEX "series_league_fixture_id_mode_unique" ON "mledb"."series" ("fixture_id", "league", "mode") `);
        await queryRunner.query(`ALTER TABLE "mledb"."series" ADD CONSTRAINT "FK_2818d2ef39569bcc3b7f1249f4f" FOREIGN KEY ("fixture_id") REFERENCES "mledb"."fixture"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."series" DROP CONSTRAINT "FK_2818d2ef39569bcc3b7f1249f4f"`);
        await queryRunner.query(`DROP INDEX "mledb"."series_league_fixture_id_mode_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series" ADD CONSTRAINT "UQ_2818d2ef39569bcc3b7f1249f4f" UNIQUE ("fixture_id")`);
        await queryRunner.query(`ALTER TABLE "mledb"."series" ADD CONSTRAINT "UQ_371dd8db459a94526009ee4d830" UNIQUE ("mode")`);
        await queryRunner.query(`ALTER TABLE "mledb"."series" ADD CONSTRAINT "UQ_baca13734353fed4536e63968bf" UNIQUE ("league")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "series_league_fixture_id_mode_unique" ON "mledb"."series" ("league", "mode", "fixture_id") `);
        await queryRunner.query(`ALTER TABLE "mledb"."series" ADD CONSTRAINT "FK_2818d2ef39569bcc3b7f1249f4f" FOREIGN KEY ("fixture_id") REFERENCES "mledb"."fixture"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
    }

}
