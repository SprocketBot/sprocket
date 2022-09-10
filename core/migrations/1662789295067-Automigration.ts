import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1662789295067 implements MigrationInterface {
    name = 'Automigration1662789295067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."division_to_franchise_group" ("id" SERIAL NOT NULL, "divison" character varying NOT NULL, "franchiseGroupId" integer NOT NULL, CONSTRAINT "PK_d8756b189a98d02d751f0ff1132" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."fixture_to_fixture" ("id" SERIAL NOT NULL, "mleFixtureId" integer NOT NULL, "sprocketFixtureId" integer NOT NULL, CONSTRAINT "PK_95d56618cb4b72434cb19380f76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."league_to_skill_group" ("id" SERIAL NOT NULL, "league" character varying NOT NULL, "skillGroupId" integer NOT NULL, CONSTRAINT "PK_8512c6e65c876c277627a76b1d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."match_to_schedule_group" ("id" SERIAL NOT NULL, "matchId" integer NOT NULL, "weekScheduleGroupId" integer NOT NULL, CONSTRAINT "PK_b403106d0b8a6a7785299fc0baf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."player_to_player" ("id" SERIAL NOT NULL, "mledPlayerId" integer NOT NULL, "sprocketPlayerId" integer NOT NULL, CONSTRAINT "PK_519f5d30db16a620f0f29b987b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."player_to_user" ("id" SERIAL NOT NULL, "playerId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_006742d1c2d56a8fd4dd56f765b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."season_to_schedule_group" ("id" SERIAL NOT NULL, "seasonNumber" integer NOT NULL, "scheduleGroupId" integer NOT NULL, CONSTRAINT "PK_e5df4f78a0f1cb2178d9aa6d2d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."team_to_franchise" ("id" SERIAL NOT NULL, "team" character varying NOT NULL, "franchiseId" integer NOT NULL, CONSTRAINT "PK_360038235154676aac26564281d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."series_to_match_parent" ("id" SERIAL NOT NULL, "seriesId" integer NOT NULL, "matchParentId" integer NOT NULL, CONSTRAINT "PK_4754d726fb515e21b0197fc055b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "mledb_bridge"."series_to_match_parent"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."team_to_franchise"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."season_to_schedule_group"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."player_to_user"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."player_to_player"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."match_to_schedule_group"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."league_to_skill_group"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."fixture_to_fixture"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."division_to_franchise_group"`);
    }

}
