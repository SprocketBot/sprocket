import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652212944683 implements MigrationInterface {
    name = 'Automigration1652212944683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member" RENAME COLUMN "discordId" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" RENAME CONSTRAINT "UQ_cb0df66149e4aab52ac820afbce" TO "UQ_08897b166dee565859b7fb2fcc8"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."member_restriction_type_enum" AS ENUM('QUEUE_BAN')`);
        await queryRunner.query(`CREATE TABLE "sprocket"."member_restriction" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" "sprocket"."member_restriction_type_enum" NOT NULL, "expiration" TIMESTAMP NOT NULL, "manualExpiration" TIMESTAMP, "memberId" integer NOT NULL, CONSTRAINT "PK_45e411646addd834fb79d1bf26c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" DROP CONSTRAINT "UQ_08897b166dee565859b7fb2fcc8"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "sprocket"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member" DROP CONSTRAINT "FK_08897b166dee565859b7fb2fcc8"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" ADD CONSTRAINT "UQ_08897b166dee565859b7fb2fcc8" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`DROP TABLE "sprocket"."member_restriction"`);
        await queryRunner.query(`DROP TYPE "sprocket"."member_restriction_type_enum"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" RENAME CONSTRAINT "UQ_08897b166dee565859b7fb2fcc8" TO "UQ_cb0df66149e4aab52ac820afbce"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" RENAME COLUMN "userId" TO "discordId"`);
    }

}
