import {Logger, ValidationPipe} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {Transport} from "@nestjs/microservices";
import {AllExceptionsFilter, config} from "@sprocketbot/common";
import {writeFile} from "fs/promises";
import {SpelunkerModule} from "nestjs-spelunker";

import {AppModule} from "./app.module";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function writeDepGraph(app: Awaited<ReturnType<typeof NestFactory.create>>): Promise<void> {
    // Teo generate graph call this in main, then start the app
    const tree = SpelunkerModule.explore(app);
    const root = SpelunkerModule.graph(tree);
    const edges = SpelunkerModule.findGraphEdges(root);
    const mermaidEdges = edges.map(({from, to}) => `${from.module.name}-->${to.module.name}`);
    const fileContent = `\`\`\`mermaid\nflowchart\n\t${mermaidEdges.join("\n\t")}\n\`\`\``;
    await writeFile(`${__dirname}/../DepTree.md`, fileContent);
}

async function bootstrap(): Promise<void> {
    // @ts-expect-error I have no idea why this one is broken but I promise it's ok.
    const app = await NestFactory.create(AppModule, {
        logger: config.logger.levels,
    });

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [config.transport.url],
            queue: config.transport.core_queue,
            queueOptions: {
                durable: true,
            },
            heartbeat: 120,
        },
    });
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());

    app.useGlobalFilters(new AllExceptionsFilter());

    const port = 3001;
    await app.startAllMicroservices();
    await app.listen(port);

    Logger.log(`API listening on :${port}`);
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
