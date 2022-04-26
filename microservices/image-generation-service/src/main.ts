import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import * as config from "config";

import {AppModule} from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.RMQ,
        logger: config.get("logger.levels"),
        options: {
            urls: [config.get("transport.url")],
            queue: config.has("transport.queue") && config.get("transport.queue"),
        },
    });
    app.listen(() => {
        /* eslint-disable no-console */
        console.log("Service Started!!");
    });
}

bootstrap().catch(console.error);
