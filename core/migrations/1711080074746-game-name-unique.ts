import { MigrationInterface, QueryRunner } from "typeorm";

export class GameNameUnique1711080074746 implements MigrationInterface {
    name = 'GameNameUnique1711080074746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game" ADD CONSTRAINT "UQ_5d1e08e04b97aa06d671cd58409" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game" DROP CONSTRAINT "UQ_5d1e08e04b97aa06d671cd58409"`);
    }

}
