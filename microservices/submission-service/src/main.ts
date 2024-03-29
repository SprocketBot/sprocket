import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {AllExceptionsFilter, config} from "@sprocketbot/common";

import {AppModule} from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url],
            queue: config.transport.submission_queue,
            queueOptions: {
                durable: true,
            },
            heartbeat: 120,
        },
    });

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen();
}

bootstrap().catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    // eslint-disable-next-line no-undef
    process.exit(1);
});
