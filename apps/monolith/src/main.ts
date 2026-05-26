import type {LogLevel} from "@nestjs/common";
import {Logger, ValidationPipe} from "@nestjs/common";
import {HttpAdapterHost, NestFactory} from "@nestjs/core";
import type {MicroserviceOptions} from "@nestjs/microservices";
import {Transport} from "@nestjs/microservices";
import {AllExceptionsFilter, config} from "@sprocketbot/common";

import {MonolithModule} from "./monolith.module";

const RMQ_CONSUMERS = [
    {name: "core", queue: config.transport.core_queue},
    {name: "discord-bot", queue: config.transport.bot_queue},
    {name: "matchmaking-service", queue: config.transport.matchmaking_queue},
    {name: "notification-service", queue: config.transport.notification_queue},
    {name: "submission-service", queue: config.transport.submission_queue},
    {name: "image-generation-service", queue: config.transport.image_generation_queue},
    {name: "server-analytics-service", queue: config.transport.analytics_queue},
];

async function bootstrap(): Promise<void> {
    const logger = new Logger("MonolithBootstrap");
    const app = await NestFactory.create(MonolithModule, {
        logger: config.logger.levels as LogLevel[],
    });

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

    for (const {name, queue} of RMQ_CONSUMERS) {
        logger.log(`Connecting ${name} consumer on RMQ queue '${queue}'`);
        app.connectMicroservice<MicroserviceOptions>({
            transport: Transport.RMQ,
            options: {
                urls: [config.transport.url],
                queue: queue,
                queueOptions: {durable: true},
                socketOptions: {heartbeat: 120},
            },
        }, {inheritAppConfig: true});
    }

    await app.startAllMicroservices();
    await app.listen(3001);
    logger.log("GraphQL API listening on http://localhost:3001/graphql");
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
