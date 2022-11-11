import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1667602673810 implements MigrationInterface {
    name = 'Automigration1667602673810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "sprocket"."game_platform"`);
        await queryRunner.query(`CREATE TABLE "sprocket"."game_platform" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "gameId" integer NOT NULL, "platformId" integer NOT NULL, "canSaveDemos" boolean NOT NULL, CONSTRAINT "PK_dd6046a3ad8469784c0ac5d0b8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_platform" ADD CONSTRAINT "FK_c5a64b96aa786ca91da4a917156" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_platform" ADD CONSTRAINT "FK_b36a6dc7f05e2250f6789655ffd" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_platform" DROP CONSTRAINT "FK_b36a6dc7f05e2250f6789655ffd"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_platform" DROP CONSTRAINT "FK_c5a64b96aa786ca91da4a917156"`);
        await queryRunner.query(`DROP TABLE "sprocket"."game_platform"`);
        await queryRunner.query(`CREATE TABLE "sprocket"."game_supported_platforms_platform" ("gameId" integer NOT NULL, "platformId" integer NOT NULL, CONSTRAINT "PK_3e24a190a311225d56254554e7b" PRIMARY KEY ("gameId", "platformId"))`);
        await queryRunner.query(`CREATE INDEX "sprocket"."IDX_18e436f71f2da0200c9b2a59e4" ON "game_supported_platforms_platform" ("gameId") `);
        await queryRunner.query(`CREATE INDEX "sprocket"."IDX_3d3a0fa6b606170f52daccd148" ON "game_supported_platforms_platform" ("platformId") `);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_supported_platforms_platform" ADD CONSTRAINT "FK_18e436f71f2da0200c9b2a59e48" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_supported_platforms_platform" ADD CONSTRAINT "FK_3d3a0fa6b606170f52daccd148b" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
