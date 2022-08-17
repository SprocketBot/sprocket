import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1660697762132 implements MigrationInterface {
    name = 'Automigration1660697762132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."player_to_user" ("id" integer NOT NULL, "playerId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_006742d1c2d56a8fd4dd56f765b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "mledb_bridge"."player_to_user"`);
    }

}
