import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1653357805239 implements MigrationInterface {
    name = 'Automigration1653357805239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "sprocket"."member_restriction_type_enum" RENAME TO "member_restriction_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."member_restriction_type_enum" AS ENUM('QUEUE_BAN', 'RATIFICATION_BAN')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ALTER COLUMN "type" TYPE "sprocket"."member_restriction_type_enum" USING "type"::"text"::"sprocket"."member_restriction_type_enum"`);
        await queryRunner.query(`DROP TYPE "sprocket"."member_restriction_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_platform_account" ADD CONSTRAINT "UQ_f9c7f41c76119643cf30177290f" UNIQUE ("platformId", "platformAccountId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member_platform_account" DROP CONSTRAINT "UQ_f9c7f41c76119643cf30177290f"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."member_restriction_type_enum_old" AS ENUM('QUEUE_BAN')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ALTER COLUMN "type" TYPE "sprocket"."member_restriction_type_enum_old" USING "type"::"text"::"sprocket"."member_restriction_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "sprocket"."member_restriction_type_enum"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."member_restriction_type_enum_old" RENAME TO "member_restriction_type_enum"`);
    }

}
