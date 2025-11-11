import { MigrationInterface, QueryRunner } from "typeorm";
export class notificationEntities1762813421816 implements MigrationInterface {
      name = 'notificationEntities1762813421816'

      public async up(queryRunner: QueryRunner): Promise<void> {
            // Create notification_template table
            await queryRunner.query(`CREATE TYPE "sprocket"."notification_template_channel_enum" AS ENUM('EMAIL', 'PUSH', 'SMS', 'IN_APP')`);
            await queryRunner.query(`CREATE TABLE "sprocket"."notification_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "channel" "sprocket"."notification_template_channel_enum" NOT NULL, "content" text NOT NULL, "defaultData" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_d2a6ef77141a01b8ac31f514cfc" PRIMARY KEY ("id"))`);

            // Create notification_history table
            await queryRunner.query(`CREATE TYPE "sprocket"."notification_history_channel_enum" AS ENUM('EMAIL', 'PUSH', 'SMS', 'IN_APP')`);
            await queryRunner.query(`CREATE TYPE "sprocket"."notification_history_status_enum" AS ENUM('PENDING', 'SENT', 'FAILED', 'RETRYING')`);
            await queryRunner.query(`CREATE TABLE "sprocket"."notification_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "channel" "sprocket"."notification_history_channel_enum" NOT NULL, "recipientId" character varying NOT NULL, "status" "sprocket"."notification_history_status_enum" NOT NULL DEFAULT 'PENDING', "templateName" character varying NOT NULL, "templateData" jsonb NOT NULL DEFAULT '{}', "errorMessage" character varying, "retryCount" integer NOT NULL DEFAULT '0', "sentAt" TIMESTAMP, "templateId" uuid, CONSTRAINT "PK_901f37d36fcc63dffdc1281d6bd" PRIMARY KEY ("id"))`);
            await queryRunner.query(`ALTER TABLE "sprocket"."notification_history" ADD CONSTRAINT "FK_c6149f7c958b143444a8cdb3b52" FOREIGN KEY ("templateId") REFERENCES "sprocket"."notification_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

            // Create user_notification_preference table
            await queryRunner.query(`CREATE TYPE "sprocket"."user_notification_preference_channel_enum" AS ENUM('EMAIL', 'PUSH', 'SMS', 'IN_APP')`);
            await queryRunner.query(`CREATE TABLE "sprocket"."user_notification_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "channel" "sprocket"."user_notification_preference_channel_enum" NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "settings" jsonb NOT NULL DEFAULT '{}', "userId" uuid, CONSTRAINT "user-channel-unq" UNIQUE ("userId", "channel"), CONSTRAINT "PK_98bedc3257235969f6ff2ec6682" PRIMARY KEY ("id"))`);
            await queryRunner.query(`ALTER TABLE "sprocket"."user_notification_preference" ADD CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3" FOREIGN KEY ("userId") REFERENCES "sprocket"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

            // Create history tracking for notification tables
            await queryRunner.query(`SELECT create_history_table('notification_template', true)`);
            await queryRunner.query(`SELECT create_history_table('notification_history', true)`);
            await queryRunner.query(`SELECT create_history_table('user_notification_preference', true)`);
      }
      public async down(queryRunner: QueryRunner): Promise<void> {
            // Drop foreign key constraints first
            await queryRunner.query(`ALTER TABLE "sprocket"."notification_history" DROP CONSTRAINT "FK_c6149f7c958b143444a8cdb3b52"`);
            await queryRunner.query(`ALTER TABLE "sprocket"."user_notification_preference" DROP CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3"`);

            // Drop tables
            await queryRunner.query(`DROP TABLE "sprocket"."notification_history"`);
            await queryRunner.query(`DROP TABLE "sprocket"."notification_template"`);
            await queryRunner.query(`DROP TABLE "sprocket"."user_notification_preference"`);

            // Drop enum types
            await queryRunner.query(`DROP TYPE "sprocket"."notification_history_status_enum"`);
            await queryRunner.query(`DROP TYPE "sprocket"."notification_history_channel_enum"`);
            await queryRunner.query(`DROP TYPE "sprocket"."notification_template_channel_enum"`);
            // Remove history tracking
            await queryRunner.query(`SELECT remove_history_table('notification_template')`);
            await queryRunner.query(`SELECT remove_history_table('notification_history')`);
            await queryRunner.query(`SELECT remove_history_table('user_notification_preference')`);

            await queryRunner.query(`DROP TYPE "sprocket"."user_notification_preference_channel_enum"`);
      }
}