import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGameFields1711079329520 implements MigrationInterface {
    name = 'AddGameFields1711079329520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD "gameId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "history"."game_mode_history" ADD "gameId" uuid`);
        await queryRunner.query(`ALTER TABLE "history"."game_mode_history" ADD "name" character varying`);

        await queryRunner.query(`ALTER TABLE "sprocket"."game" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "history"."game_history" ADD "name" character varying`);
        
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" ADD "gameId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "history"."skill_group_history" ADD "gameId" uuid`);
        
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD CONSTRAINT "FK_1591079e6dddb2d90e90e94fdc2" FOREIGN KEY ("gameId") REFERENCES "sprocket"."game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" ADD CONSTRAINT "FK_71c23df338af5dbf94e453cf53c" FOREIGN KEY ("gameId") REFERENCES "sprocket"."game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" DROP CONSTRAINT "FK_71c23df338af5dbf94e453cf53c"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP CONSTRAINT "FK_1591079e6dddb2d90e90e94fdc2"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP COLUMN "gameId"`);
    }

}
