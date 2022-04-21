/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument,no-console,no-undef */
import "reflect-metadata";

import {NestFactory} from "@nestjs/core";
import {GraphQLSchemaBuilderModule, GraphQLSchemaFactory} from "@nestjs/graphql";
import {writeFile} from "fs/promises";
import {glob} from "glob";
import {printSchema} from "graphql";
import {Parser} from "graphql-js-tree";
import {TreeToTS} from "graphql-zeus";
import {flatten} from "lodash";

async function generateSchema(): Promise<void> {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule);
    await app.init();


    const resolvers: Function[] = flatten(await Promise.all(glob.sync(`${__dirname}/**/*.resolver.ts`, {}).map(async f => {
        const mod = await import(f);
        return Object.values(mod).filter(r => {
            if (typeof r === "function" && r.prototype) {
                return Reflect.hasMetadata("graphql:resolver_name", r);
            }
            return false;
        });
    }))) as Function[];
  
    const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
    const schema = await gqlSchemaFactory.create(resolvers);
    const tsDef = TreeToTS.resolveTree({tree: Parser.parse(printSchema(schema))});
    await writeFile(`${__dirname}/../gql-client/gql-client.ts`, tsDef);
}

generateSchema().catch(console.error);
