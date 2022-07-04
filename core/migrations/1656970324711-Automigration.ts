import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656970324711 implements MigrationInterface {
    name = 'Automigration1656970324711'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "primaryColor" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "secondaryColor" character varying DEFAULT ''`);

        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ALTER COLUMN "primaryColor" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ALTER COLUMN "secondaryColor" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ALTER COLUMN "primaryColor" DROP DEFAULT `);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ALTER COLUMN "secondaryColor" DROP DEFAULT `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "secondaryColor"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "primaryColor"`);
    }
}
