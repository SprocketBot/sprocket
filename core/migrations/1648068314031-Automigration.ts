import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1648068314031 implements MigrationInterface {
    name = 'Automigration1648068314031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_type_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "type" "public"."user_type_enum" array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
    }

}
