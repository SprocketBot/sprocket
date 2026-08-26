import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {config} from "@sprocketbot/common";

import {AppModule} from "./app.module";

const HEALTH_PORT = 3014;

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {logger: config.logger.levels});

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url],
            queue: config.transport.image_generation_queue,
        },
    });

    await app.startAllMicroservices();
    await app.listen(HEALTH_PORT);
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
