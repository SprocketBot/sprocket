import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1666463689317 implements MigrationInterface {
    name = 'Automigration1666463689317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "history"."user_history" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "sprocket"."user_type_enum"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ALTER COLUMN "skillGroupId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_group_type" DROP CONSTRAINT "FK_fb786f931ab2a1db8b6f8785940"`);
        await queryRunner.query(`ALTER TABLE "schedule_group_type" ALTER COLUMN "organizationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" DROP CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d"`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" DROP CONSTRAINT "FK_78a0874f503f718434346afedc4"`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ALTER COLUMN "awayFranchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ALTER COLUMN "homeFranchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_652e04e862dac0c611e6a929ab3"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_0cbb30ed058102b0f260e911e3c"`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "franchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "skillGroupId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" DROP CONSTRAINT "FK_095432105c4860d594fd9545c47"`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" DROP CONSTRAINT "FK_f790210c8106972edb55c49f572"`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" DROP CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3"`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" DROP CONSTRAINT "UQ_f9c7f41c76119643cf30177290f"`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ALTER COLUMN "memberId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ALTER COLUMN "platformId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organization_profile" DROP CONSTRAINT "FK_73c3c1ad47d63dbf79b7ae73cd9"`);
        await queryRunner.query(`ALTER TABLE "organization_profile" ALTER COLUMN "organizationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP CONSTRAINT "FK_a7d585f90b53ca4833a100e0d8b"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ALTER COLUMN "franchiseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ADD CONSTRAINT "UQ_f9c7f41c76119643cf30177290f" UNIQUE ("platformId", "platformAccountId")`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_group_type" ADD CONSTRAINT "FK_fb786f931ab2a1db8b6f8785940" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ADD CONSTRAINT "FK_78a0874f503f718434346afedc4" FOREIGN KEY ("homeFranchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ADD CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d" FOREIGN KEY ("awayFranchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_652e04e862dac0c611e6a929ab3" FOREIGN KEY ("franchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_0cbb30ed058102b0f260e911e3c" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ADD CONSTRAINT "FK_095432105c4860d594fd9545c47" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ADD CONSTRAINT "FK_f790210c8106972edb55c49f572" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ADD CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_profile" ADD CONSTRAINT "FK_73c3c1ad47d63dbf79b7ae73cd9" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD CONSTRAINT "FK_a7d585f90b53ca4833a100e0d8b" FOREIGN KEY ("franchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "franchise_profile" DROP CONSTRAINT "FK_a7d585f90b53ca4833a100e0d8b"`);
        await queryRunner.query(`ALTER TABLE "organization_profile" DROP CONSTRAINT "FK_73c3c1ad47d63dbf79b7ae73cd9"`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" DROP CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3"`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" DROP CONSTRAINT "FK_f790210c8106972edb55c49f572"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" DROP CONSTRAINT "FK_095432105c4860d594fd9545c47"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_0cbb30ed058102b0f260e911e3c"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_652e04e862dac0c611e6a929ab3"`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" DROP CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d"`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" DROP CONSTRAINT "FK_78a0874f503f718434346afedc4"`);
        await queryRunner.query(`ALTER TABLE "schedule_group_type" DROP CONSTRAINT "FK_fb786f931ab2a1db8b6f8785940"`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" DROP CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4"`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" DROP CONSTRAINT "UQ_f9c7f41c76119643cf30177290f"`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ALTER COLUMN "franchiseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "franchise_profile" ADD CONSTRAINT "FK_a7d585f90b53ca4833a100e0d8b" FOREIGN KEY ("franchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_profile" ALTER COLUMN "organizationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organization_profile" ADD CONSTRAINT "FK_73c3c1ad47d63dbf79b7ae73cd9" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ALTER COLUMN "platformId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ALTER COLUMN "memberId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ADD CONSTRAINT "UQ_f9c7f41c76119643cf30177290f" UNIQUE ("platformAccountId", "platformId")`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ADD CONSTRAINT "FK_f7455aa82715ab0e817f8e6ade3" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_platform_account" ADD CONSTRAINT "FK_f790210c8106972edb55c49f572" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_authentication_account" ADD CONSTRAINT "FK_095432105c4860d594fd9545c47" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "skillGroupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "franchiseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_0cbb30ed058102b0f260e911e3c" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_652e04e862dac0c611e6a929ab3" FOREIGN KEY ("franchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ALTER COLUMN "homeFranchiseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ALTER COLUMN "awayFranchiseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ADD CONSTRAINT "FK_78a0874f503f718434346afedc4" FOREIGN KEY ("homeFranchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_fixture" ADD CONSTRAINT "FK_61ef1b6aff93c92ca17d2c64e1d" FOREIGN KEY ("awayFranchiseId") REFERENCES "franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_group_type" ALTER COLUMN "organizationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_group_type" ADD CONSTRAINT "FK_fb786f931ab2a1db8b6f8785940" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ALTER COLUMN "skillGroupId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_skill_group_profile" ADD CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4" FOREIGN KEY ("skillGroupId") REFERENCES "game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "sprocket"."user_type_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "history"."user_history" ADD "type" "sprocket"."user_type_enum" array`);
        await queryRunner.query(`ALTER TABLE "user" ADD "type" "sprocket"."user_type_enum" array`);
    }

}