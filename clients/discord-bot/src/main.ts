import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {AllExceptionsFilter} from "@sprocketbot/common";
import * as config from "config";
import fetch from "node-fetch";

import {AppModule} from "./app.module";

// eslint-disable-next-line no-undef, @typescript-eslint/no-unsafe-assignment
global.fetch = fetch;

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.RMQ,
        logger: config.get("logger.levels"),
        options: {
            urls: [config.get("transport.url")],
            queue: config.get("transport.bot_queue"),
            queueOptions: {
                durable: true,
            },
            heartbeat: 120,
        },
    });

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen();
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
