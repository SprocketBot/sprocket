import { MigrationInterface, QueryRunner } from "typeorm";
export class addPlayerCount1711744024059 implements MigrationInterface {
  name = 'addPlayerCount1711744024059'

  public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD "playerCount" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ALTER COLUMN "playerCount" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "history"."game_mode_history" ADD "playerCount" integer`);

        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD "teamSize" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ALTER COLUMN "teamSize" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "history"."game_mode_history" ADD "teamSize" integer`);
  }
  public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP COLUMN "playerCount"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP COLUMN "teamSize"`);
  }
}