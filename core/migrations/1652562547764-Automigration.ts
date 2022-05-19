import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652562547764 implements MigrationInterface {
    name = 'Automigration1652562547764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sprocket"."image_template" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "templateStructure" jsonb NOT NULL, "reportCode" character varying NOT NULL, "displayName" character varying NOT NULL, "description" character varying NOT NULL, "query" jsonb NOT NULL, CONSTRAINT "PK_4bb1f1284941f8eeccd28d22ed4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP CONSTRAINT "FK_1591079e6dddb2d90e90e94fdc2"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ALTER COLUMN "gameId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP CONSTRAINT "FK_622bd2e2975785c536a74754290"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ALTER COLUMN "skillGroupId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD CONSTRAINT "FK_1591079e6dddb2d90e90e94fdc2" FOREIGN KEY ("gameId") REFERENCES "sprocket"."game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD CONSTRAINT "FK_622bd2e2975785c536a74754290" FOREIGN KEY ("skillGroupId") REFERENCES "sprocket"."game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP CONSTRAINT "FK_622bd2e2975785c536a74754290"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP CONSTRAINT "FK_1591079e6dddb2d90e90e94fdc2"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ALTER COLUMN "skillGroupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD CONSTRAINT "FK_622bd2e2975785c536a74754290" FOREIGN KEY ("skillGroupId") REFERENCES "sprocket"."game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ALTER COLUMN "gameId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD CONSTRAINT "FK_1591079e6dddb2d90e90e94fdc2" FOREIGN KEY ("gameId") REFERENCES "sprocket"."game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`DROP TABLE "sprocket"."image_template"`);
    }

}
