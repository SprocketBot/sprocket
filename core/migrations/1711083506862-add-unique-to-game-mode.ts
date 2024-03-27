import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueToGameMode1711083506862 implements MigrationInterface {
    name = 'AddUniqueToGameMode1711083506862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" ADD CONSTRAINT "game-name-unq" UNIQUE ("gameId", "name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_mode" DROP CONSTRAINT "game-name-unq"`);
    }

}
