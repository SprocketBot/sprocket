import type {MiddlewareConsumer, NestModule} from "@nestjs/common";
import {Module} from "@nestjs/common";
import {GraphQLModule} from "@nestjs/graphql";
import {config} from "@sprocketbot/common";
import {graphqlUploadExpress} from "graphql-upload";

import {ConfigurationModule} from "./configuration";
import {DatabaseModule} from "./database";
import {FranchiseModule} from "./franchise";
import {GameModule} from "./game";
import {IdentityModule} from "./identity";
import {AuthModule} from "./identity/auth";
import {ImageGenerationModule} from "./image-generation";
import {MledbInterfaceModule} from "./mledb";
import {OrganizationModule} from "./organization";
import {ReplayParseModule} from "./replay-parse";
import {SchedulingModule} from "./scheduling";
import {ScrimModule} from "./scrim";

@Module({
    imports: [
        GraphQLModule.forRoot({
            autoSchemaFile: true,
            installSubscriptionHandlers: true,
            playground: config.gql.playground,
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

            // https://stackoverflow.com/questions/63991157/how-do-i-upload-multiple-files-with-nestjs-graphql
            uploads: false,
        }),
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
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(graphqlUploadExpress()).forRoutes("graphql");
    }
}
