import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1660698234296 implements MigrationInterface {
    name = 'Automigration1660698234296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "mledb_bridge"."player_to_user_id_seq" OWNED BY "mledb_bridge"."player_to_user"."id"`);
        await queryRunner.query(`ALTER TABLE "mledb_bridge"."player_to_user" ALTER COLUMN "id" SET DEFAULT nextval('"mledb_bridge"."player_to_user_id_seq"')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb_bridge"."player_to_user" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "mledb_bridge"."player_to_user_id_seq"`);
    }

}
