import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1658085241798 implements MigrationInterface {
    name = 'Automigration1658085241798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP CONSTRAINT "FK_3ae22b968bc60673e610c78dd39"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP CONSTRAINT "UQ_3ae22b968bc60673e610c78dd39"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "photoId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "primaryColor"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "secondaryColor"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match" ADD "isNcp" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" DROP CONSTRAINT "PK_22e2d8ec820a98efbfdbf84d925"`);
        await queryRunner.query(`DROP INDEX "mledb"."player_stats_pkey"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ADD "id" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ADD CONSTRAINT "PK_22e2d8ec820a98efbfdbf84d925" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" DROP CONSTRAINT "PK_4607af5f62fe79cfc00c65d0223"`);
        await queryRunner.query(`DROP INDEX "mledb"."team_core_stats_pkey"`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ADD "id" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ADD CONSTRAINT "PK_4607af5f62fe79cfc00c65d0223" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ALTER COLUMN "profileId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_78a0874f503f718434346afedc4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "homeFranchiseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "awayFranchiseId" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "player_stats_pkey" ON "mledb"."player_stats" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "team_core_stats_pkey" ON "mledb"."team_core_stats" ("id") `);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "sprocket"."franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_78a0874f503f718434346afedc4" FOREIGN KEY ("homeFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d" FOREIGN KEY ("awayFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" DROP CONSTRAINT "FK_78a0874f503f718434346afedc4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`DROP INDEX "mledb"."team_core_stats_pkey"`);
        await queryRunner.query(`DROP INDEX "mledb"."player_stats_pkey"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "awayFranchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ALTER COLUMN "homeFranchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d" FOREIGN KEY ("awayFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_fixture" ADD CONSTRAINT "FK_78a0874f503f718434346afedc4" FOREIGN KEY ("homeFranchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ALTER COLUMN "profileId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "sprocket"."franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" DROP CONSTRAINT "PK_4607af5f62fe79cfc00c65d0223"`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "team_core_stats_pkey" ON "mledb"."team_core_stats" ("id") `);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ADD CONSTRAINT "PK_4607af5f62fe79cfc00c65d0223" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" DROP CONSTRAINT "PK_22e2d8ec820a98efbfdbf84d925"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "player_stats_pkey" ON "mledb"."player_stats" ("id") `);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ADD CONSTRAINT "PK_22e2d8ec820a98efbfdbf84d925" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match" DROP COLUMN "isNcp"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "secondaryColor" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "primaryColor" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "photoId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD CONSTRAINT "UQ_3ae22b968bc60673e610c78dd39" UNIQUE ("photoId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD CONSTRAINT "FK_3ae22b968bc60673e610c78dd39" FOREIGN KEY ("photoId") REFERENCES "sprocket"."photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
