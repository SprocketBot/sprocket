import {ValidationPipe} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {config} from "@sprocketbot/common";

import {AppModule} from "./app.module";

async function bootstrap(): Promise<void> {
    // @ts-expect-error I have no idea why this one is broken but I promise it's ok.
    const app = await NestFactory.create(AppModule, {
        logger: config.logger.levels,
    });
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    const port = 3001;
    await app.listen(port);
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
