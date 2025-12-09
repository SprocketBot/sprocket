import { NestFactory } from "@nestjs/core";
import { AllExceptionsFilter } from "@sprocketbot/common";
import { AppModule } from "./app.module";
import { ImageGenerationService } from "./image-generation/image-generation.service";
import { Logger } from "@nestjs/common";
import { Pool } from "pg";
import { config } from "@sprocketbot/common";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExceptionsFilter());

    const logger = new Logger("Main");
    const imageGenerationService = app.get(ImageGenerationService);

    // Database connection for polling
    const pool = new Pool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.username,
        password: config.db.password,
        database: config.db.database,
    });

    logger.log("Starting Image Generation Service (Polling Mode)");

    const poll = async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const res = await client.query(`
                SELECT id, payload, "retryCount"
                FROM event_queue
                WHERE status = 'PENDING' AND "targetService" = 'IMAGE_GEN'
                ORDER BY "createdAt" ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            `);

            if (res.rows.length > 0) {
                const task = res.rows[0];
                logger.log(`Picked up task ${task.id}`);

                try {
                    const payload = task.payload;
                    // Assuming payload structure matches what ImageGenerationService expects
                    // The controller previously parsed: ImageGenerationSchemas.GenerateImage.input.parse(payload)
                    // We might need to validate here or inside the service.
                    // For now, passing directly as the service method signature suggests.

                    await imageGenerationService.processSvg(payload.inputFile, payload.outputFile, payload.template);

                    await client.query(`
                        UPDATE event_queue
                        SET status = 'PROCESSED', "processedAt" = NOW()
                        WHERE id = $1
                    `, [task.id]);

                    logger.log(`Task ${task.id} processed successfully`);
                } catch (err) {
                    logger.error(`Error processing task ${task.id}: ${err}`);

                    await client.query(`
                        UPDATE event_queue
                        SET status = 'FAILED', "retryCount" = "retryCount" + 1
                        WHERE id = $1
                    `, [task.id]);
                }
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            logger.error(`Polling error: ${e}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer on error
        } finally {
            client.release();
        }

        // Schedule next poll
        setTimeout(poll, 1000);
    };

    // Start polling loop
    poll();
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
