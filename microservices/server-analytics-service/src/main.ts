/* eslint-disable no-console */
import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {config} from "@sprocketbot/common";

import {AppModule} from "./app.module";

const url = config.transport.url;
const queue = config.transport.analytics_queue;
const HEALTH_PORT = 3013;

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {logger: config.logger.levels});

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [url],
            queue: queue,
            queueOptions: {
                durable: true,
            },
        },
    });

    await app.startAllMicroservices();
    await app.listen(HEALTH_PORT);
}

bootstrap()
    .then(() => {
        console.log(`Microservice started! Connected to RMQ at '${url}', on queue '${queue}'`);
    })
    .catch(console.error);
