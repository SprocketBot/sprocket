import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarToUserAuthAccount1710967901443 implements MigrationInterface {
    name = 'AddAvatarToUserAuthAccount1710967901443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "sprocket"."user_auth_account_platform_enum" RENAME TO "user_auth_account_platform_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sprocket"."user_auth_account_platform_enum" AS ENUM('DISCORD', 'STEAM')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" ALTER COLUMN "platform" TYPE "sprocket"."user_auth_account_platform_enum" USING "platform"::"text"::"sprocket"."user_auth_account_platform_enum"`);
        await queryRunner.query(`ALTER TABLE "history"."user_auth_account_history" ALTER COLUMN "platform" TYPE "sprocket"."user_auth_account_platform_enum" USING "platform"::"text"::"sprocket"."user_auth_account_platform_enum"`);
        await queryRunner.query(`DROP TYPE "sprocket"."user_auth_account_platform_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "sprocket"."user_auth_account_platform_enum_old" AS ENUM('DISCORD')`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" ALTER COLUMN "platform" TYPE "sprocket"."user_auth_account_platform_enum_old" USING "platform"::"text"::"sprocket"."user_auth_account_platform_enum_old"`);
        await queryRunner.query(`DROP TYPE "sprocket"."user_auth_account_platform_enum"`);
        await queryRunner.query(`ALTER TYPE "sprocket"."user_auth_account_platform_enum_old" RENAME TO "user_auth_account_platform_enum"`);
    }

}
