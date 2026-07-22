/* eslint-disable no-console */
import {NestFactory} from "@nestjs/core";
import {config, PostgresServer} from "@sprocketbot/common";

import {AppModule} from "./app.module";

const queue = config.transport.analytics_queue;
const HEALTH_PORT = 3013;

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {logger: config.logger.levels});
    app.enableShutdownHooks();

    app.connectMicroservice({
        strategy: new PostgresServer({queue}),
    });

    await app.startAllMicroservices();
    await app.listen(HEALTH_PORT);
}

bootstrap()
    .then(() => {
        console.log(`Microservice started on Postgres transport queue '${queue}'`);
    })
    .catch(console.error);
