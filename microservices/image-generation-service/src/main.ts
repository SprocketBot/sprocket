import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {config} from "@sprocketbot/common/lib/util/config";

import {AppModule} from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url],
            queue: config.transport.image_generation_queue,
        },
    });
    await app.listen();
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
