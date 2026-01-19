import { MigrationInterface, QueryRunner } from 'typeorm';

export class Automigration1659622217377 implements MigrationInterface {
  name = 'Automigration1659622217377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "round" ADD "gameModeId" integer`);
    await queryRunner.query(`ALTER TABLE "match" ADD "gameModeId" integer`);
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_a552a5746921c2f921def8e1feb"`);
    await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "skillGroupId" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "game_skill_group" DROP CONSTRAINT "FK_0d41e2ff4e742d1af247da56425"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_skill_group" ALTER COLUMN "organizationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_08897b166dee565859b7fb2fcc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_8122e5920a29af5ef76e2e2ff62"`,
    );
    await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "userId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "organizationId" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "round" ADD CONSTRAINT "FK_b308044dc6e999d6008a6cf4ad2" FOREIGN KEY ("gameModeId") REFERENCES "game_mode"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_a552a5746921c2f921def8e1feb" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_8be3d9cb8a809d47b159b0f571b" FOREIGN KEY ("gameModeId") REFERENCES "game_mode"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_skill_group" ADD CONSTRAINT "FK_0d41e2ff4e742d1af247da56425" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_8122e5920a29af5ef76e2e2ff62" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_08897b166dee565859b7fb2fcc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_8122e5920a29af5ef76e2e2ff62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_skill_group" DROP CONSTRAINT "FK_0d41e2ff4e742d1af247da56425"`,
    );
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_8be3d9cb8a809d47b159b0f571b"`);
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_a552a5746921c2f921def8e1feb"`);
    await queryRunner.query(`ALTER TABLE "round" DROP CONSTRAINT "FK_b308044dc6e999d6008a6cf4ad2"`);
    await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "organizationId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "userId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_8122e5920a29af5ef76e2e2ff62" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_skill_group" ALTER COLUMN "organizationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_skill_group" ADD CONSTRAINT "FK_0d41e2ff4e742d1af247da56425" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "match" ALTER COLUMN "skillGroupId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_a552a5746921c2f921def8e1feb" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "gameModeId"`);
    await queryRunner.query(`ALTER TABLE "round" DROP COLUMN "gameModeId"`);
  }
}
