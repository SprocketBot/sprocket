import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652144341797 implements MigrationInterface {
    name = 'Automigration1652144341797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" DROP CONSTRAINT "FK_9dd1fc0ee74c5dbc362bb9d082d"`);
        await queryRunner.query(`DROP INDEX "mledb"."fixture_home_name_away_name_match_id_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" DROP CONSTRAINT "UQ_aa46e5704233c54f18cc77134ab"`);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" DROP CONSTRAINT "UQ_37b0cf93e0f8f740c27d68c2f6b"`);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" DROP CONSTRAINT "UQ_9dd1fc0ee74c5dbc362bb9d082d"`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`CREATE UNIQUE INDEX "fixture_home_name_away_name_match_id_unique" ON "mledb"."fixture" ("away_name", "home_name", "match_id") `);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" ADD CONSTRAINT "FK_9dd1fc0ee74c5dbc362bb9d082d" FOREIGN KEY ("match_id") REFERENCES "mledb"."match"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" DROP CONSTRAINT "FK_9dd1fc0ee74c5dbc362bb9d082d"`);
        await queryRunner.query(`DROP INDEX "mledb"."fixture_home_name_away_name_match_id_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" ADD CONSTRAINT "UQ_9dd1fc0ee74c5dbc362bb9d082d" UNIQUE ("match_id")`);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" ADD CONSTRAINT "UQ_37b0cf93e0f8f740c27d68c2f6b" UNIQUE ("away_name")`);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" ADD CONSTRAINT "UQ_aa46e5704233c54f18cc77134ab" UNIQUE ("home_name")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "fixture_home_name_away_name_match_id_unique" ON "mledb"."fixture" ("home_name", "away_name", "match_id") `);
        await queryRunner.query(`ALTER TABLE "mledb"."fixture" ADD CONSTRAINT "FK_9dd1fc0ee74c5dbc362bb9d082d" FOREIGN KEY ("match_id") REFERENCES "mledb"."match"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
    }

}
