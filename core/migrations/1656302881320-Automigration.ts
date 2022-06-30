import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656302881320 implements MigrationInterface {
    name = 'Automigration1656302881320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."match" ADD "skillGroupId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match" ADD CONSTRAINT "FK_a552a5746921c2f921def8e1feb" FOREIGN KEY ("skillGroupId") REFERENCES "sprocket"."game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."match" DROP CONSTRAINT "FK_a552a5746921c2f921def8e1feb"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match" DROP COLUMN "skillGroupId"`);
    }

}
