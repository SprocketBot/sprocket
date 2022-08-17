import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1660702467769 implements MigrationInterface {
    name = 'Automigration1660702467769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."team_to_franchise" ("id" SERIAL NOT NULL, "team" character varying NOT NULL, "franchiseId" integer NOT NULL, CONSTRAINT "PK_360038235154676aac26564281d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "mledb_bridge"."team_to_franchise"`);
    }

}
