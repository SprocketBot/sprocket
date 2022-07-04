import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656294825011 implements MigrationInterface {
    name = 'Automigration1656294825011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group" DROP CONSTRAINT "FK_1b6a651f78ce0209633237fe945"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "FK_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization" DROP CONSTRAINT "FK_0b10df9cf789464c09784b32e4c"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP CONSTRAINT "FK_adb40c3fbfade82e3293f62dd31"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user" DROP CONSTRAINT "FK_2ffc8d3455097079866bfca4d47"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" DROP CONSTRAINT "FK_b9bb63f508aa958461750fb21db"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group" DROP CONSTRAINT "REL_1b6a651f78ce0209633237fe94"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group" DROP COLUMN "profileId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP CONSTRAINT "UQ_35d150504cce7d58d2140713a3a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" DROP COLUMN "profileId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization" DROP CONSTRAINT "REL_0b10df9cf789464c09784b32e4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization" DROP COLUMN "organizationProfileId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP CONSTRAINT "REL_adb40c3fbfade82e3293f62dd3"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP COLUMN "profileId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user" DROP CONSTRAINT "REL_2ffc8d3455097079866bfca4d4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user" DROP COLUMN "userProfileId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" DROP CONSTRAINT "REL_b9bb63f508aa958461750fb21d"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" DROP COLUMN "profileId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group_profile" ADD "groupId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group_profile" ADD CONSTRAINT "UQ_dc7b58cf6d990ec80bf267c8820" UNIQUE ("groupId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "franchiseId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD CONSTRAINT "UQ_a7d585f90b53ca4833a100e0d8b" UNIQUE ("franchiseId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD "skillGroupId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD CONSTRAINT "UQ_238a74250d4d8eb06dbc931cfb4" UNIQUE ("skillGroupId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_profile" ADD "organizationId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_profile" ADD CONSTRAINT "UQ_73c3c1ad47d63dbf79b7ae73cd9" UNIQUE ("organizationId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" ADD "memberId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" ADD CONSTRAINT "UQ_434917136b073ff315d700c9f54" UNIQUE ("memberId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ADD CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group_profile" ADD CONSTRAINT "FK_dc7b58cf6d990ec80bf267c8820" FOREIGN KEY ("groupId") REFERENCES "sprocket"."franchise_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD CONSTRAINT "FK_a7d585f90b53ca4833a100e0d8b" FOREIGN KEY ("franchiseId") REFERENCES "sprocket"."franchise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4" FOREIGN KEY ("skillGroupId") REFERENCES "sprocket"."game_skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_profile" ADD CONSTRAINT "FK_73c3c1ad47d63dbf79b7ae73cd9" FOREIGN KEY ("organizationId") REFERENCES "sprocket"."organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" ADD CONSTRAINT "FK_434917136b073ff315d700c9f54" FOREIGN KEY ("memberId") REFERENCES "sprocket"."member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "sprocket"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" DROP CONSTRAINT "FK_434917136b073ff315d700c9f54"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_profile" DROP CONSTRAINT "FK_73c3c1ad47d63dbf79b7ae73cd9"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP CONSTRAINT "FK_238a74250d4d8eb06dbc931cfb4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP CONSTRAINT "FK_a7d585f90b53ca4833a100e0d8b"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group_profile" DROP CONSTRAINT "FK_dc7b58cf6d990ec80bf267c8820"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" DROP CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" DROP CONSTRAINT "UQ_434917136b073ff315d700c9f54"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_profile" DROP COLUMN "memberId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_profile" DROP CONSTRAINT "UQ_73c3c1ad47d63dbf79b7ae73cd9"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_profile" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP CONSTRAINT "UQ_238a74250d4d8eb06dbc931cfb4"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "skillGroupId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP CONSTRAINT "UQ_a7d585f90b53ca4833a100e0d8b"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "franchiseId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group_profile" DROP CONSTRAINT "UQ_dc7b58cf6d990ec80bf267c8820"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group_profile" DROP COLUMN "groupId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" ADD CONSTRAINT "REL_b9bb63f508aa958461750fb21d" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user" ADD "userProfileId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user" ADD CONSTRAINT "REL_2ffc8d3455097079866bfca4d4" UNIQUE ("userProfileId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD CONSTRAINT "REL_adb40c3fbfade82e3293f62dd3" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization" ADD "organizationProfileId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization" ADD CONSTRAINT "REL_0b10df9cf789464c09784b32e4" UNIQUE ("organizationProfileId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "UQ_35d150504cce7d58d2140713a3a" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group" ADD "profileId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group" ADD CONSTRAINT "REL_1b6a651f78ce0209633237fe94" UNIQUE ("profileId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member" ADD CONSTRAINT "FK_b9bb63f508aa958461750fb21db" FOREIGN KEY ("profileId") REFERENCES "sprocket"."member_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user" ADD CONSTRAINT "FK_2ffc8d3455097079866bfca4d47" FOREIGN KEY ("userProfileId") REFERENCES "sprocket"."user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD CONSTRAINT "FK_adb40c3fbfade82e3293f62dd31" FOREIGN KEY ("profileId") REFERENCES "sprocket"."game_skill_group_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization" ADD CONSTRAINT "FK_0b10df9cf789464c09784b32e4c" FOREIGN KEY ("organizationProfileId") REFERENCES "sprocket"."organization_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise" ADD CONSTRAINT "FK_35d150504cce7d58d2140713a3a" FOREIGN KEY ("profileId") REFERENCES "sprocket"."franchise_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_group" ADD CONSTRAINT "FK_1b6a651f78ce0209633237fe945" FOREIGN KEY ("profileId") REFERENCES "sprocket"."franchise_group_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
