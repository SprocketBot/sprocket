import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656304361153 implements MigrationInterface {
    name = 'Automigration1656304361153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD "organizationId" integer default 1`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "FK_89f1666e9c718ec392e20c0c1b0" FOREIGN KEY ("organizationId") REFERENCES "sprocket"."organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE franchise ALTER COLUMN "organizationId" DROP DEFAULT`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "FK_89f1666e9c718ec392e20c0c1b0"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP COLUMN "organizationId"`);
    }

}
