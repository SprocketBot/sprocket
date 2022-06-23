import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1655683292378 implements MigrationInterface {
    name = 'Automigration1655683292378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."roster_slot" ADD "playerId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."roster_slot" ADD CONSTRAINT "UQ_65df30440996ca94023ffbf3ed8" UNIQUE ("playerId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."roster_slot" ADD CONSTRAINT "FK_65df30440996ca94023ffbf3ed8" FOREIGN KEY ("playerId") REFERENCES "sprocket"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."roster_slot" DROP CONSTRAINT "FK_65df30440996ca94023ffbf3ed8"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."roster_slot" DROP CONSTRAINT "UQ_65df30440996ca94023ffbf3ed8"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."roster_slot" DROP COLUMN "playerId"`);
    }

}
