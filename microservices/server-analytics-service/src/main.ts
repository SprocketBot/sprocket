/* eslint-disable no-console */
import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {AllExceptionsFilter, config} from "@sprocketbot/common";

import {AppModule} from "./app.module";

const url = config.transport.url;
const queue = config.transport.analytics_queue;

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.RMQ,
        logger: config.logger.levels,
        options: {
            urls: [url],
            queue: queue,
            queueOptions: {
                durable: true,
            },
        },
    });

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen();
}

bootstrap()
    .then(() => {
        console.log(`Microservice started! Connected to RMQ at '${url}', on queue '${queue}'`);
    })
    .catch(console.error);
