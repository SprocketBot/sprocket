import { MigrationInterface, QueryRunner } from "typeorm";
export class skillGroupFields1711576135540 implements MigrationInterface {
  name = 'skillGroupFields1711576135540'

  public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "history"."skill_group_history" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "history"."skill_group_history" ADD "code" character varying`);
  }
  public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" DROP COLUMN "code"`);
  }
}