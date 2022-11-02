import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1666464459062 implements MigrationInterface {
    name = 'Automigration1666464459062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_staff_role" ADD "organizationId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" ADD "organizationId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organization_staff_role" ADD CONSTRAINT "FK_a93871feaabc6c6851596ac4360" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" ADD CONSTRAINT "FK_44b5b0568463286b8468d76cd13" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_staff_team" DROP CONSTRAINT "FK_44b5b0568463286b8468d76cd13"`);
        await queryRunner.query(`ALTER TABLE "organization_staff_role" DROP CONSTRAINT "FK_a93871feaabc6c6851596ac4360"`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "organization_staff_role" DROP COLUMN "organizationId"`);
    }

}
