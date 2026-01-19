import { MigrationInterface, QueryRunner } from 'typeorm';

export class Automigration1664131770208 implements MigrationInterface {
  name = 'Automigration1664131770208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sprocket"."player" ALTER COLUMN "salary" TYPE double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sprocket"."player" ALTER COLUMN "salary" TYPE numeric`);
  }
}
