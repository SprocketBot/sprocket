import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { NotificationsService } from "./notifications/notifications.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // app.useGlobalFilters(new AllExceptionsFilter()); // Common module missing, skipping filter for now

  const logger = new Logger('Main');
  const notificationsService = app.get(NotificationsService);

  // Database connection for polling - reuse env vars from other services
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
  });

  logger.log('Starting Discord Notification Service (Polling Mode)');

  const poll = async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(`
                SELECT id, payload, "retryCount"
                FROM event_queue
                WHERE status = 'PENDING' AND "targetService" = 'NOTIFICATIONS'
                ORDER BY "createdAt" ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            `);

      if (res.rows.length > 0) {
        const task = res.rows[0];
        logger.log(`Picked up task ${task.id}`);

        try {
          logger.debug(`Processing notification payload: ${JSON.stringify(task.payload)}`);

          await notificationsService.sendNotification(task.payload);

          await client.query(
            `
                        UPDATE event_queue
                        SET status = 'PROCESSED', "processedAt" = NOW()
                        WHERE id = $1
                    `,
            [task.id],
          );

          logger.log(`Task ${task.id} processed successfully`);
        } catch (err) {
          logger.error(`Error processing task ${task.id}: ${err}`);

          await client.query(
            `
                        UPDATE event_queue
                        SET status = 'FAILED', "retryCount" = "retryCount" + 1
                        WHERE id = $1
                    `,
            [task.id],
          );
        }
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      logger.error(`Polling error: ${e}`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait longer on error
    } finally {
      client.release();
    }

    // Schedule next poll
    setTimeout(poll, 1000);
  };

  // Start polling loop
  poll();
}

bootstrap();
