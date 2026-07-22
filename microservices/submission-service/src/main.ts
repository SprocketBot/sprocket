import {NestFactory} from "@nestjs/core";
import {config, PostgresServer} from "@sprocketbot/common";

import {AppModule} from "./app.module";

const HEALTH_PORT = 3012;

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {logger: config.logger.levels});
    app.enableShutdownHooks();

    app.connectMicroservice({
        strategy: new PostgresServer({queue: config.transport.submission_queue}),
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
