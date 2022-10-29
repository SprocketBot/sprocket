import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1666537679198 implements MigrationInterface {
    name = 'Automigration1666537679198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_staff_team" DROP CONSTRAINT "FK_9d86ca7e7759f11d2b6d4a9924d"`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" DROP CONSTRAINT "REL_9d86ca7e7759f11d2b6d4a9924"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group" DROP CONSTRAINT "FK_0079be59193106a41231b161615"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group" ALTER COLUMN "gameId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_40e1ded9fbf4f2d9a6fcb9616a3"`);
        await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "memberId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" ADD CONSTRAINT "FK_9d86ca7e7759f11d2b6d4a9924d" FOREIGN KEY ("bearerId") REFERENCES "permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group" ADD CONSTRAINT "FK_0079be59193106a41231b161615" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_40e1ded9fbf4f2d9a6fcb9616a3" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_40e1ded9fbf4f2d9a6fcb9616a3"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group" DROP CONSTRAINT "FK_0079be59193106a41231b161615"`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" DROP CONSTRAINT "FK_9d86ca7e7759f11d2b6d4a9924d"`);
        await queryRunner.query(`ALTER TABLE "player" ALTER COLUMN "memberId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_40e1ded9fbf4f2d9a6fcb9616a3" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group" ALTER COLUMN "gameId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_skill_group" ADD CONSTRAINT "FK_0079be59193106a41231b161615" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" ADD CONSTRAINT "REL_9d86ca7e7759f11d2b6d4a9924" UNIQUE ("bearerId")`);
        await queryRunner.query(`ALTER TABLE "organization_staff_team" ADD CONSTRAINT "FK_9d86ca7e7759f11d2b6d4a9924d" FOREIGN KEY ("bearerId") REFERENCES "permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
