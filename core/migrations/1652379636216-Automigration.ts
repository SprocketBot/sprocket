import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652379636216 implements MigrationInterface {
    name = 'Automigration1652379636216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD "memberId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD "gameId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD "salary" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD CONSTRAINT "FK_0079be59193106a41231b161615" FOREIGN KEY ("gameId") REFERENCES "sprocket"."game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD CONSTRAINT "FK_40e1ded9fbf4f2d9a6fcb9616a3" FOREIGN KEY ("memberId") REFERENCES "sprocket"."member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP CONSTRAINT "FK_40e1ded9fbf4f2d9a6fcb9616a3"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP CONSTRAINT "FK_0079be59193106a41231b161615"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD "salary" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP COLUMN "memberId"`);
    }

}
