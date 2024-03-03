import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1659142612043 implements MigrationInterface {
    name = 'Automigration1659142612043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "franchise" DROP CONSTRAINT "REL_35d150504cce7d58d2140713a3"`);
        await queryRunner.query(`ALTER TABLE "franchise" DROP COLUMN "profileId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "franchise" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "franchise" ADD CONSTRAINT "REL_35d150504cce7d58d2140713a3" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
