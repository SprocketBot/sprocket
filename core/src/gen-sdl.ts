import { NestFactory } from "@nestjs/core";
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql";
import { printSchema } from "graphql";
import fs from "fs/promises";
import path from "path";

async function genSdl() {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();
  
    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
    const domainDir = path.join(__dirname, 'gql');
    const allFiles = await fs.readdir(domainDir, { withFileTypes: true, recursive: true })
    
    const entityModules = await Promise.all(
        allFiles
          .filter((f) => f.isFile() && f.name.endsWith('.resolver.ts'))
          .map((f) => path.join(f.parentPath, f.name))
          .map((f) => import(f).then(m => {
            return Object.entries(m).filter((x): x is [string, Function] => {
                return Reflect.hasMetadata('graphql:resolver_name', x[1]);
            }).map<Function>(([k, v]) => v)
          }))
    );

    const schema = await gqlSchemaFactory.create(entityModules.flat());
    fs.writeFile(path.join(__dirname, '..','..', 'clients','web','schema.graphql'), printSchema(schema));
}

// @ts-expect-error bun supports top-level await
await genSdl()