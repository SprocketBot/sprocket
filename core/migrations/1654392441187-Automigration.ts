import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1654392441187 implements MigrationInterface {
    name = 'Automigration1654392441187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "sprocket"."organization_configuration_key_code_enum" RENAME TO "organization_configuration_key_code_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."organization_configuration_key_code_enum" AS ENUM('SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ALTER COLUMN "code" TYPE "sprocket"."organization_configuration_key_code_enum" USING "code"::"text"::"sprocket"."organization_configuration_key_code_enum"`);
        await queryRunner.query(`DROP TYPE "sprocket"."organization_configuration_key_code_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "sprocket"."organization_configuration_key_code_enum_old" AS ENUM('SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_SECONDS', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_SECONDS', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ALTER COLUMN "code" TYPE "sprocket"."organization_configuration_key_code_enum_old" USING "code"::"text"::"sprocket"."organization_configuration_key_code_enum_old"`);
        await queryRunner.query(`DROP TYPE "sprocket"."organization_configuration_key_code_enum"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."organization_configuration_key_code_enum_old" RENAME TO "organization_configuration_key_code_enum"`);
    }

}
