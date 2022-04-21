import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import * as config from "config";

import {AppModule} from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.NATS,
        logger: config.get("logger.levels"),
        options: {
            url: config.get("transport.url"),
        },
    });
    app.listen(() => {
        /* eslint-disable no-console */
        console.log("Service Started!!");
    });
}

bootstrap().catch(console.error);
