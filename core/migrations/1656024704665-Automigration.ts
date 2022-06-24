import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656024704665 implements MigrationInterface {
    name = 'Automigration1656024704665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."player_stat_line" ADD "playerId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player_stat_line" ADD CONSTRAINT "FK_4c07ad25b7f13fce8342245b003" FOREIGN KEY ("playerId") REFERENCES "sprocket"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."player_stat_line" DROP CONSTRAINT "FK_4c07ad25b7f13fce8342245b003"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player_stat_line" DROP COLUMN "playerId"`);
    }

}
