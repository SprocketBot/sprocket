import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656303497708 implements MigrationInterface {
    name = 'Automigration1656303497708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_meta" DROP CONSTRAINT "FK_0f9e7c4013624a6c635dd9c8558"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_meta" DROP CONSTRAINT "REL_0f9e7c4013624a6c635dd9c855"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_meta" DROP COLUMN "parentId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" ADD "scrimMetaId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" ADD CONSTRAINT "UQ_4e90a2680bf629db257a552c533" UNIQUE ("scrimMetaId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" ADD CONSTRAINT "FK_4e90a2680bf629db257a552c533" FOREIGN KEY ("scrimMetaId") REFERENCES "sprocket"."scrim_meta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" DROP CONSTRAINT "FK_4e90a2680bf629db257a552c533"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" DROP CONSTRAINT "UQ_4e90a2680bf629db257a552c533"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" DROP COLUMN "scrimMetaId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_meta" ADD "parentId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_meta" ADD CONSTRAINT "REL_0f9e7c4013624a6c635dd9c855" UNIQUE ("parentId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_meta" ADD CONSTRAINT "FK_0f9e7c4013624a6c635dd9c8558" FOREIGN KEY ("parentId") REFERENCES "sprocket"."match_parent"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
