import {ValidationPipe} from "@nestjs/common";
import {HttpAdapterHost, NestFactory} from "@nestjs/core";
import {AllExceptionsFilter, config, PostgresServer} from "@sprocketbot/common";
import {ht} from "date-fns/locale";
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
    const app = await NestFactory.create(AppModule, {
        logger: config.logger.levels,
    });

    app.connectMicroservice({
        strategy: new PostgresServer({queue: config.transport.core_queue}),
    });
    app.enableCors({
        origin: true,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });
    app.useGlobalPipes(new ValidationPipe());

    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    const port = 3001;
    await app.startAllMicroservices();
    await app.listen(port);
    // eslint-disable-next-line no-console
    console.log(`GraphQL Playground available at http://localhost:${port}/graphql`);
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
