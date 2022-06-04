import {ValidationPipe} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {config} from "@sprocketbot/common";

import {AppModule} from "./app.module";

async function bootstrap(): Promise<void> {
    // @ts-expect-error I have no idea why this one is broken but I promise it's ok.
    const app = await NestFactory.create(AppModule, {
        logger: config.logger.levels,
    });

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url],
            queue: config.transport.core_queue,
            queueOptions: {
                durable: true,
            },
            heartbeat: 120,
        },
    });
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    const port = 3001;
    await app.startAllMicroservices();
    await app.listen(port);
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
