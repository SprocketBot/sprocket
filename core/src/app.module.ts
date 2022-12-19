import {BullModule} from "@nestjs/bull";
import type {MiddlewareConsumer, NestModule} from "@nestjs/common";
import {Module} from "@nestjs/common";
import {GraphQLModule} from "@nestjs/graphql";
import {TypeOrmModule} from "@nestjs/typeorm";
import {config} from "@sprocketbot/common";
import {RedisCache} from "apollo-server-cache-redis";
import {readFileSync} from "fs";
import {graphqlUploadExpress} from "graphql-upload";

import {AuthenticationModule} from "./authentication/authentication.module";
import {AuthorizationModule} from "./authorization/authorization.module";
import {ConfigurationModule} from "./configuration/configuration.module";
import {DraftModule} from "./draft/draft.module";
import {FranchiseModule} from "./franchise/franchise.module";
import {GameModule} from "./game/game.module";
import {IdentityModule} from "./identity/identity.module";
import {ImageGenerationModule} from "./image-generation/image-generation.module";
import {OrganizationModule} from "./organization/organization.module";
import {SchedulingModule} from "./scheduling/scheduling.module";
import {WebhookModule} from "./webhook/webhook.module";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: config.db.host,
            port: config.db.port,
            username: config.db.username,
            password: readFileSync("./secret/db-password.txt").toString().trim(),
            database: config.db.database,
            autoLoadEntities: true,
            logging: config.db.enable_logs,
        }),
        GraphQLModule.forRoot({
            autoSchemaFile: true,
            installSubscriptionHandlers: true,
            cache: new RedisCache({
                host: config.cache.host,
                port: config.cache.port,
                password: config.cache.password,
                keyPrefix: "gql_cache__",
                db: 13,
                tls: config.cache.secure
                    ? {
                          host: config.cache.host,
                          servername: config.cache.host,
                      }
                    : undefined,
            }),
            playground: config.gql.playground,
            fieldResolverEnhancers: ["guards"],
            context: ({connection, req, payload}) => {
                if (connection) {
                    const token = payload?.context?.authorization as string | undefined;
                    return {
                        req: {
                            authorization: token,
                            headers: {authorization: token},
                        },
                    };
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                return {req};
            },
            tracing: true,

            // https://stackoverflow.com/questions/63991157/how-do-i-upload-multiple-files-with-nestjs-graphql
            uploads: false,
        }),
        BullModule.forRoot({
            redis: {
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password,
                tls: config.redis.secure
                    ? {
                          host: config.redis.host,
                          servername: config.redis.host,
                      }
                    : undefined,
                keyPrefix: `${config.redis.prefix}:bull`,
            },
            prefix: `${config.redis.prefix}:bull`,
        }),
        AuthorizationModule,
        AuthenticationModule,
        ConfigurationModule,
        DraftModule,
        FranchiseModule,
        GameModule,
        IdentityModule,
        ImageGenerationModule,
        OrganizationModule,
        SchedulingModule,
        WebhookModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(graphqlUploadExpress()).forRoutes("graphql");
    }
}
