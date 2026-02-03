import {Logger} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import type {MicroserviceOptions} from "@nestjs/microservices";
import {Transport} from "@nestjs/microservices";

import {AllExceptionsFilter, config} from "@sprocketbot/common";

import {MonolithModule} from "./monolith.module";

async function bootstrap() {
    const logger = new Logger("MonolithBootstrap");

    // Create hybrid application (HTTP + Microservices)
    const app = await NestFactory.create(MonolithModule);

    // Enable CORS (from Core service)
    app.enableCors();

    // Global exception filter
    const httpAdapterHost = app.get("HttpAdapterHost");
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

    // Connect all 7 RabbitMQ microservices
    const microserviceConfigs = [
        {name: "Core", queue: config.transport.core_queue},
        {name: "Bot", queue: config.transport.bot_queue},
        {name: "Matchmaking", queue: config.transport.matchmaking_queue},
        {name: "Notification", queue: config.transport.notification_queue},
        {name: "Submission", queue: config.transport.submission_queue},
        {name: "ImageGeneration", queue: config.transport.image_generation_queue},
        {name: "Analytics", queue: config.transport.analytics_queue},
    ];

    for (const {name, queue} of microserviceConfigs) {
        logger.log(`Connecting microservice: ${name} (queue: ${queue})`);
        app.connectMicroservice<MicroserviceOptions>({
            transport: Transport.RMQ,
            options: {
                urls: [config.transport.url] as string[],
                queue,
                queueOptions: {durable: true},
                socketOptions: {heartbeatIntervalInSeconds: 120},
            },
        });
    }

    // Start all microservices
    await app.startAllMicroservices();
    logger.log("All microservices started");

    // Start HTTP server (from Core service)
    const httpPort = 3001;
    await app.listen(httpPort);
    logger.log(`HTTP server listening on http://localhost:${httpPort}`);
    logger.log(`GraphQL Playground: http://localhost:${httpPort}/graphql`);
}

bootstrap();
