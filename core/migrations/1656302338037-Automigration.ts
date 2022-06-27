import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656302338037 implements MigrationInterface {
    name = 'Automigration1656302338037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" ADD "fixtureId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ALTER COLUMN "profileId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_78a0874f503f718434346afedc4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "homeFranchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "awayFranchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "sprocket"."franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_78a0874f503f718434346afedc4" FOREIGN KEY ("homeFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d" FOREIGN KEY ("awayFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" ADD CONSTRAINT "FK_3c8003f9b1a74a7a88f4ab358ed" FOREIGN KEY ("fixtureId") REFERENCES "sprocket"."schedule_fixture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" DROP CONSTRAINT "FK_3c8003f9b1a74a7a88f4ab358ed"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_78a0874f503f718434346afedc4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "awayFranchiseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "homeFranchiseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d" FOREIGN KEY ("awayFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_78a0874f503f718434346afedc4" FOREIGN KEY ("homeFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ALTER COLUMN "profileId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "sprocket"."franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match_parent" DROP COLUMN "fixtureId"`);
    }

}
