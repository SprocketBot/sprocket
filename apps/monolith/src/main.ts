import {ValidationPipe} from "@nestjs/common";
import {HttpAdapterHost, NestFactory} from "@nestjs/core";
import {
    AllExceptionsFilter,
    config,
    PostgresServer,
} from "@sprocketbot/common";
import fetch from "node-fetch";
import {Request, Response} from "express";

import {corsOptions, corsPreflightMiddleware} from "../../../core/src/cors";
import {MonolithModule} from "./monolith.module";

// eslint-disable-next-line no-undef, @typescript-eslint/no-unsafe-assignment
global.fetch = fetch as any;

const CONSUMERS = [
    {name: "core", queue: config.transport.core_queue},
    {name: "discord-bot", queue: config.transport.bot_queue},
    {name: "matchmaking-service", queue: config.transport.matchmaking_queue},
    {name: "notification-service", queue: config.transport.notification_queue},
    {name: "submission-service", queue: config.transport.submission_queue},
    {name: "image-generation-service", queue: config.transport.image_generation_queue},
    {name: "server-analytics-service", queue: config.transport.analytics_queue},
];

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(MonolithModule, {
        logger: config.logger.levels,
    });

    app.getHttpAdapter().getInstance().get("/healthz", (_req: Request, res: Response) => {
        res.status(200).json({
            status: "ok",
            runtime: "monolith",
            services: CONSUMERS.map(({name}) => name),
        });
    });

    app.use(corsPreflightMiddleware);
    app.enableCors(corsOptions);
    app.useGlobalPipes(new ValidationPipe());

    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    for (const {name, queue} of CONSUMERS) {
        app.connectMicroservice({
            strategy: new PostgresServer({queue}),
        });
        // eslint-disable-next-line no-console
        console.log(`Connected ${name} Postgres RPC consumer on queue '${queue}'`);
    }

    const port = 3001;
    await app.startAllMicroservices();
    await app.listen(port);
    // eslint-disable-next-line no-console
    console.log(`Sprocket monolith listening at http://localhost:${port}`);
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
