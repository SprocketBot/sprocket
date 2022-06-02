import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1654128967924 implements MigrationInterface {
    name = 'Automigration1654128967924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" DROP COLUMN "code"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."organization_configuration_key_code_enum" AS ENUM('SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_SECONDS', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_SECONDS', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ADD "code" "sprocket"."organization_configuration_key_code_enum" NOT NULL`);
        await queryRunner.query(`ALTER TYPE "sprocket"."member_restriction_type_enum" RENAME TO "member_restriction_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."member_restriction_type_enum" AS ENUM('QUEUE_BAN')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ALTER COLUMN "type" TYPE "sprocket"."member_restriction_type_enum" USING "type"::"text"::"sprocket"."member_restriction_type_enum"`);
        await queryRunner.query(`DROP TYPE "sprocket"."member_restriction_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "sprocket"."member_restriction_type_enum_old" AS ENUM('QUEUE_BAN', 'RATIFICATION_BAN')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ALTER COLUMN "type" TYPE "sprocket"."member_restriction_type_enum_old" USING "type"::"text"::"sprocket"."member_restriction_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "sprocket"."member_restriction_type_enum"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."member_restriction_type_enum_old" RENAME TO "member_restriction_type_enum"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" DROP COLUMN "code"`);
        await queryRunner.query(`DROP TYPE "sprocket"."organization_configuration_key_code_enum"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."organization_configuration_key" ADD "code" character varying NOT NULL`);
    }

}
