import type {MiddlewareConsumer, NestModule} from "@nestjs/common";
import {Module} from "@nestjs/common";
import {GraphQLModule} from "@nestjs/graphql";
import {config} from "@sprocketbot/common";
import {RedisCache} from "apollo-server-cache-redis";
import {graphqlUploadExpress} from "graphql-upload";

import {ConfigurationModule} from "./configuration";
import {DatabaseModule} from "./database";
import {EloModule} from "./elo";
import {FranchiseModule} from "./franchise";
import {GameModule} from "./game";
import {IdentityModule} from "./identity";
import {AuthModule} from "./identity/auth";
import {ImageGenerationModule} from "./image-generation";
import {MledbInterfaceModule} from "./mledb";
import {NotificationModule} from "./notification/notification.module";
import {OrganizationModule} from "./organization";
import {ReplayParseModule} from "./replay-parse";
import {SchedulingModule} from "./scheduling";
import {ScrimModule} from "./scrim";
import {SprocketRatingModule} from "./sprocket-rating";
import {SubmissionModule} from "./submission";
import {UtilModule} from "./util/util.module";

@Module({
    imports: [
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
            introspection: config.gql.playground,
            fieldResolverEnhancers: ["guards"],
            context: ({
                connection, req, payload,
            }) => {
                if (connection) {
                    const token = payload?.context?.authorization as string | undefined;
                    return {req: {authorization: token, headers: {authorization: token}}};
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                return {req};
            },
            tracing: true,

            // https://stackoverflow.com/questions/63991157/how-do-i-upload-multiple-files-with-nestjs-graphql
            uploads: false,
        }),
        // BullModule.forRoot() removed - now configured in MonolithModule
        OrganizationModule,
        IdentityModule,
        DatabaseModule,
        ConfigurationModule,
        GameModule,
        ReplayParseModule,
        ScrimModule,
        AuthModule,
        SchedulingModule,
        MledbInterfaceModule,
        FranchiseModule,
        ImageGenerationModule,
        SprocketRatingModule,
        UtilModule,
        EloModule,
        SubmissionModule,
        NotificationModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(graphqlUploadExpress()).forRoutes("graphql");
    }
}
