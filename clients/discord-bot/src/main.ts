import {HttpAdapterHost, NestFactory} from "@nestjs/core";
import {AllExceptionsFilter, config, PostgresServer} from "@sprocketbot/common";
import fetch from "node-fetch";

import {AppModule} from "./app.module";

// eslint-disable-next-line no-undef, @typescript-eslint/no-unsafe-assignment
global.fetch = fetch as any;

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        logger: config.logger.levels,
        strategy: new PostgresServer({queue: config.transport.bot_queue}),
    });

    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    await app.listen();
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
