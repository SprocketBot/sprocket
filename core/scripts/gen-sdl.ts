import { NestFactory } from "@nestjs/core";
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql";
import { writeFile } from "fs/promises";
import { glob } from "glob";
import { printSchema } from "graphql";
import { promisify } from "util";

async function generateSchema(): Promise<void> {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();

    // This is needed because GraphQLSchemaFactory expects an array of this type
    // eslint-disable-next-line @typescript-eslint/ban-types
    const resolvers: Function[] = []

    const resolverPaths = await promisify(glob)("./**/*.resolver.ts", { realpath: true })
    await Promise.all(resolverPaths.map(async resolverPath => {
        try {
            const resolverModule = await import(resolverPath)
            for (const [exportKey, exportValue] of Object.entries(resolverModule)) {
                if (exportKey.toLowerCase().endsWith("resolver") && typeof exportValue === "function") {
                    resolvers.push(exportValue)
                }
            }
        } catch (e) {
            console.error(`Failed to import ${resolverPath}`)
            throw e
        }

    }))

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
    const schema = await gqlSchemaFactory.create(resolvers);
    const schemaString = printSchema(schema);
    await writeFile("./schema.graphql", schemaString)
}

generateSchema()
