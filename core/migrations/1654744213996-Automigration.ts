import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1654744213996 implements MigrationInterface {
    name = 'Automigration1654744213996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ALTER COLUMN "type" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ALTER COLUMN "type" SET DEFAULT 'STRING'`);
    }

}
