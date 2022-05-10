import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652144737438 implements MigrationInterface {
    name = 'Automigration1652144737438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" DROP CONSTRAINT "FK_283d060f9d008d02b17a936d1a3"`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" DROP CONSTRAINT "FK_dbd58feca9a6592f1ff8560f054"`);
        await queryRunner.query(`DROP INDEX "mledb"."elo_data_player_id_replay_id_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" DROP CONSTRAINT "UQ_283d060f9d008d02b17a936d1a3"`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" DROP CONSTRAINT "UQ_dbd58feca9a6592f1ff8560f054"`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "league" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`CREATE UNIQUE INDEX "elo_data_player_id_replay_id_unique" ON "mledb"."elo_data" ("player_id", "replay_id") `);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ADD CONSTRAINT "FK_dbd58feca9a6592f1ff8560f054" FOREIGN KEY ("replay_id") REFERENCES "mledb"."series_replay"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ADD CONSTRAINT "FK_283d060f9d008d02b17a936d1a3" FOREIGN KEY ("player_id") REFERENCES "mledb"."player"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" DROP CONSTRAINT "FK_283d060f9d008d02b17a936d1a3"`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" DROP CONSTRAINT "FK_dbd58feca9a6592f1ff8560f054"`);
        await queryRunner.query(`DROP INDEX "mledb"."elo_data_player_id_replay_id_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "league" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ADD CONSTRAINT "UQ_dbd58feca9a6592f1ff8560f054" UNIQUE ("replay_id")`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ADD CONSTRAINT "UQ_283d060f9d008d02b17a936d1a3" UNIQUE ("player_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "elo_data_player_id_replay_id_unique" ON "mledb"."elo_data" ("player_id", "replay_id") `);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ADD CONSTRAINT "FK_dbd58feca9a6592f1ff8560f054" FOREIGN KEY ("replay_id") REFERENCES "mledb"."series_replay"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ADD CONSTRAINT "FK_283d060f9d008d02b17a936d1a3" FOREIGN KEY ("player_id") REFERENCES "mledb"."player"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
    }

}
