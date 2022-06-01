import type {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1653957690298 implements MigrationInterface {
    name = "Automigration1653957690298";

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "UQ_35d150504cce7d58d2140713a3a" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "sprocket"."franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "UQ_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP COLUMN "profileId"`);
    }

}
