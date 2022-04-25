import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";

import {AppModule} from "./app.module";
import {config} from "./util/config";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url],
            queue: config.transport.matchmaking_queue,
            queueOptions: {
                durable: true,
            },
            heartbeat: 120,
        },
    });
    await app.listen();
}

bootstrap().catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    // eslint-disable-next-line no-undef
    process.exit(1);
});
