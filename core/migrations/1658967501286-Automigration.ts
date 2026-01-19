import { MigrationInterface, QueryRunner } from 'typeorm';

export class Automigration1658967501286 implements MigrationInterface {
  name = 'Automigration1658967501286';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "sprocket"."round_parser_enum" AS ENUM('carball', 'ballchasing')`,
    );
    await queryRunner.query(
      `ALTER TABLE "round" ADD "parser" "sprocket"."round_parser_enum" NOT NULL DEFAULT 'ballchasing'`,
    );
    await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "parser" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "round" ADD "parserVersion" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "parserVersion" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "round" ADD "outputPath" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE "round" ALTER COLUMN "outputPath" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "round" DROP COLUMN "outputPath"`);
    await queryRunner.query(`ALTER TABLE "round" DROP COLUMN "parserVersion"`);
    await queryRunner.query(`ALTER TABLE "round" DROP COLUMN "parser"`);
    await queryRunner.query(`DROP TYPE "sprocket"."round_parser_enum"`);
  }
}
