import {MigrationInterface, QueryRunner} from "typeorm";

export class AddReqRatificationsKey1659301588400 implements MigrationInterface {
    name = 'AddReqRatificationsKey'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "sprocket"."organization_configuration_key_code_enum" RENAME TO "organization_configuration_key_code_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."organization_configuration_key_code_enum" AS ENUM('SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS', 'PRIMARY_DISCORD_GUILD_SNOWFLAKE', 'ALTERNATE_DISCORD_GUILD_SNOWFLAKES', 'REPORT_CARD_DISCORD_WEBHOOK_URL', 'SCRIM_REQUIRED_RATIFICATIONS')`);
        await queryRunner.query(`ALTER TABLE "organization_configuration_key" ALTER COLUMN "code" TYPE "sprocket"."organization_configuration_key_code_enum" USING "code"::"text"::"sprocket"."organization_configuration_key_code_enum"`);
        await queryRunner.query(`DROP TYPE "sprocket"."organization_configuration_key_code_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "sprocket"."organization_configuration_key_code_enum_old" AS ENUM('SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS', 'PRIMARY_DISCORD_GUILD_SNOWFLAKE', 'ALTERNATE_DISCORD_GUILD_SNOWFLAKES', 'REPORT_CARD_DISCORD_WEBHOOK_URL')`);
        await queryRunner.query(`ALTER TABLE "organization_configuration_key" ALTER COLUMN "code" TYPE "sprocket"."organization_configuration_key_code_enum_old" USING "code"::"text"::"sprocket"."organization_configuration_key_code_enum_old"`);
        await queryRunner.query(`DROP TYPE "sprocket"."organization_configuration_key_code_enum"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."organization_configuration_key_code_enum_old" RENAME TO "organization_configuration_key_code_enum"`);
    }

}
