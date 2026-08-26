import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {config} from "@sprocketbot/common";

import {AppModule} from "./app.module";

const HEALTH_PORT = 3010;

async function bootstrap(): Promise<void> {
    const rmqOptions: any = {
        urls: [config.transport.url],
        queue: config.transport.matchmaking_queue,
        queueOptions: {
            durable: true,
        },
        heartbeat: 120,
    };

    // Add authentication if environment variables are provided
    const rmqUser = process.env.RABBITMQ_DEFAULT_USER;
    const rmqPass = process.env.RABBITMQ_DEFAULT_PASS;

    if (rmqUser && rmqPass) {
        rmqOptions.options = {
            credentials: {
                username: rmqUser,
                password: rmqPass,
            },
        };
    }

    const app = await NestFactory.create(AppModule, {logger: config.logger.levels});

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: rmqOptions,
    });

    await app.startAllMicroservices();
    await app.listen(HEALTH_PORT);
}

bootstrap().catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    // eslint-disable-next-line no-undef
    process.exit(1);
});
