import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1667425496972 implements MigrationInterface {
    name = 'Automigration1667425496972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "FK_c5a64b96aa786ca91da4a917156"`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "FK_b36a6dc7f05e2250f6789655ffd"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_c5a64b96aa786ca91da4a91715"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_b36a6dc7f05e2250f6789655ff"`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "PK_1dc0ba06fc44ca9f53d3f086050"`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "PK_bbb2b70ae8b78b00b269fe12ea4" PRIMARY KEY ("gameId", "platformId", "id")`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD "canSaveDemos" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "PK_bbb2b70ae8b78b00b269fe12ea4"`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "PK_937680e0fa9298a2c5ad0948c23" PRIMARY KEY ("platformId", "id")`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "PK_937680e0fa9298a2c5ad0948c23"`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "PK_dd6046a3ad8469784c0ac5d0b8b" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "FK_c5a64b96aa786ca91da4a917156" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "FK_b36a6dc7f05e2250f6789655ffd" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "FK_b36a6dc7f05e2250f6789655ffd"`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "FK_c5a64b96aa786ca91da4a917156"`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "PK_dd6046a3ad8469784c0ac5d0b8b"`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "PK_937680e0fa9298a2c5ad0948c23" PRIMARY KEY ("platformId", "id")`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "PK_937680e0fa9298a2c5ad0948c23"`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "PK_bbb2b70ae8b78b00b269fe12ea4" PRIMARY KEY ("gameId", "platformId", "id")`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP COLUMN "canSaveDemos"`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP CONSTRAINT "PK_bbb2b70ae8b78b00b269fe12ea4"`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "PK_1dc0ba06fc44ca9f53d3f086050" PRIMARY KEY ("gameId", "platformId")`);
        await queryRunner.query(`ALTER TABLE "game_platform" DROP COLUMN "id"`);
        await queryRunner.query(`CREATE INDEX "IDX_b36a6dc7f05e2250f6789655ff" ON "game_platform" ("platformId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5a64b96aa786ca91da4a91715" ON "game_platform" ("gameId") `);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "FK_b36a6dc7f05e2250f6789655ffd" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "game_platform" ADD CONSTRAINT "FK_c5a64b96aa786ca91da4a917156" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
