import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652635224941 implements MigrationInterface {
    name = 'Automigration1652635224941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."platform" ADD "code" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."platform" DROP COLUMN "code"`);
    }

}
