import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656304158604 implements MigrationInterface {
    name = 'Automigration1656304158604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."match" ADD "submissionId" character varying`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match" ADD CONSTRAINT "UQ_08da1ddd1ce32a10b2ac02a112a" UNIQUE ("submissionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."match" DROP CONSTRAINT "UQ_08da1ddd1ce32a10b2ac02a112a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."match" DROP COLUMN "submissionId"`);
    }

}
