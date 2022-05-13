import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652406567664 implements MigrationInterface {
    name = 'Automigration1652406567664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" DROP CONSTRAINT "FK_afac34d97905cc53ae5e1b91b1d"`);
        await queryRunner.query(`CREATE TABLE "sprocket"."member_profile_pronouns_pronouns" ("memberProfileId" integer NOT NULL, "pronounsId" integer NOT NULL, CONSTRAINT "PK_4eec15db692a6d54c160c13b1f7" PRIMARY KEY ("memberProfileId", "pronounsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fc4cc6ac08c933863d7123cdb2" ON "sprocket"."member_profile_pronouns_pronouns" ("memberProfileId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f01f15a8073e85e0943f65add5" ON "sprocket"."member_profile_pronouns_pronouns" ("pronounsId") `);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" DROP COLUMN "pronounsId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile_pronouns_pronouns" ADD CONSTRAINT "FK_fc4cc6ac08c933863d7123cdb24" FOREIGN KEY ("memberProfileId") REFERENCES "sprocket"."member_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile_pronouns_pronouns" ADD CONSTRAINT "FK_f01f15a8073e85e0943f65add52" FOREIGN KEY ("pronounsId") REFERENCES "sprocket"."pronouns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile_pronouns_pronouns" DROP CONSTRAINT "FK_f01f15a8073e85e0943f65add52"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile_pronouns_pronouns" DROP CONSTRAINT "FK_fc4cc6ac08c933863d7123cdb24"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" ADD "pronounsId" integer`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_f01f15a8073e85e0943f65add5"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_fc4cc6ac08c933863d7123cdb2"`);
        await queryRunner.query(`DROP TABLE "sprocket"."member_profile_pronouns_pronouns"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" ADD CONSTRAINT "FK_afac34d97905cc53ae5e1b91b1d" FOREIGN KEY ("pronounsId") REFERENCES "sprocket"."pronouns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
