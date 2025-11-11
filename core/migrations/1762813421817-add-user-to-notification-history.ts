import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserToNotificationHistory1762813421817 implements MigrationInterface {
    name = 'addUserToNotificationHistory1762813421817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add userId column to notification_history table
        await queryRunner.query(`ALTER TABLE "sprocket"."notification_history" ADD COLUMN "userId" uuid`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "sprocket"."notification_history" ADD CONSTRAINT "FK_notification_history_user" FOREIGN KEY ("userId") REFERENCES "sprocket"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE`);

        // Update history tracking to include the new column
        await queryRunner.query(`SELECT update_history_table('notification_history', ARRAY['userId'])`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint first
        await queryRunner.query(`ALTER TABLE "sprocket"."notification_history" DROP CONSTRAINT "FK_notification_history_user"`);

        // Remove userId column
        await queryRunner.query(`ALTER TABLE "sprocket"."notification_history" DROP COLUMN "userId"`);

        // Update history tracking to remove the column
        await queryRunner.query(`SELECT update_history_table('notification_history', ARRAY[]::text[])`);
    }
}