import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1662856797223 implements MigrationInterface {
    name = 'Automigration1662856797223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" ADD "discordEmojiId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_leadership_role" DROP CONSTRAINT "FK_7e2b3f74d7fd48a30ef15aec1de"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_leadership_role" DROP CONSTRAINT "REL_7e2b3f74d7fd48a30ef15aec1d"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."organization_configuration_key_code_enum" RENAME TO "organization_configuration_key_code_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."organization_configuration_key_code_enum" AS ENUM('SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS', 'PRIMARY_DISCORD_GUILD_SNOWFLAKE', 'ALTERNATE_DISCORD_GUILD_SNOWFLAKES', 'REPORT_CARD_DISCORD_WEBHOOK_URL', 'SCRIM_REQUIRED_RATIFICATIONS', 'SKILL_GROUP_CHANGE_DISCORD_WEBHOOK_URL', 'TRANSACTIONS_DISCORD_WEBHOOK_URL')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ALTER COLUMN "code" TYPE "sprocket"."organization_configuration_key_code_enum" USING "code"::"text"::"sprocket"."organization_configuration_key_code_enum"`);
        await queryRunner.query(`DROP TYPE "sprocket"."organization_configuration_key_code_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_staff_role" DROP CONSTRAINT "FK_075a700938ebdcaef94e5672d57"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_staff_role" DROP CONSTRAINT "REL_075a700938ebdcaef94e5672d5"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_staff_role" DROP CONSTRAINT "FK_8dceec978102c8fda542d208bd1"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_staff_role" DROP CONSTRAINT "REL_8dceec978102c8fda542d208bd"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_leadership_role" ADD CONSTRAINT "FK_7e2b3f74d7fd48a30ef15aec1de" FOREIGN KEY ("bearerId") REFERENCES "sprocket"."permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_staff_role" ADD CONSTRAINT "FK_075a700938ebdcaef94e5672d57" FOREIGN KEY ("bearerId") REFERENCES "sprocket"."permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_staff_role" ADD CONSTRAINT "FK_8dceec978102c8fda542d208bd1" FOREIGN KEY ("bearerId") REFERENCES "sprocket"."permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_staff_role" DROP CONSTRAINT "FK_8dceec978102c8fda542d208bd1"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_staff_role" DROP CONSTRAINT "FK_075a700938ebdcaef94e5672d57"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_leadership_role" DROP CONSTRAINT "FK_7e2b3f74d7fd48a30ef15aec1de"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_staff_role" ADD CONSTRAINT "REL_8dceec978102c8fda542d208bd" UNIQUE ("bearerId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_staff_role" ADD CONSTRAINT "FK_8dceec978102c8fda542d208bd1" FOREIGN KEY ("bearerId") REFERENCES "sprocket"."permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_staff_role" ADD CONSTRAINT "REL_075a700938ebdcaef94e5672d5" UNIQUE ("bearerId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_staff_role" ADD CONSTRAINT "FK_075a700938ebdcaef94e5672d57" FOREIGN KEY ("bearerId") REFERENCES "sprocket"."permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "sprocket"."organization_configuration_key_code_enum_old" AS ENUM('SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS', 'PRIMARY_DISCORD_GUILD_SNOWFLAKE', 'ALTERNATE_DISCORD_GUILD_SNOWFLAKES', 'REPORT_CARD_DISCORD_WEBHOOK_URL', 'SCRIM_REQUIRED_RATIFICATIONS')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ALTER COLUMN "code" TYPE "sprocket"."organization_configuration_key_code_enum_old" USING "code"::"text"::"sprocket"."organization_configuration_key_code_enum_old"`);
        await queryRunner.query(`DROP TYPE "sprocket"."organization_configuration_key_code_enum"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."organization_configuration_key_code_enum_old" RENAME TO "organization_configuration_key_code_enum"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_leadership_role" ADD CONSTRAINT "REL_7e2b3f74d7fd48a30ef15aec1d" UNIQUE ("bearerId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_leadership_role" ADD CONSTRAINT "FK_7e2b3f74d7fd48a30ef15aec1de" FOREIGN KEY ("bearerId") REFERENCES "sprocket"."permission_bearer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "discordEmojiId"`);
    }

}
