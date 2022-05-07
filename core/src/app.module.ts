import type {MiddlewareConsumer, NestModule} from "@nestjs/common";
import {Module} from "@nestjs/common";
import {GraphQLModule} from "@nestjs/graphql";
import {graphqlUploadExpress} from "graphql-upload";

import {ConfigurationModule} from "./configuration/configuration.module";
import {DatabaseModule} from "./database/database.module";
import {GameModule} from "./game/game.module";
import {AuthModule} from "./identity/auth/auth.module";
import {IdentityModule} from "./identity/identity.module";
import {UserService} from "./identity/user/user.service";
import {OrganizationModule} from "./organization/organization.module";
import {ReplayParseModule} from "./replay-parse/replay-parse.module";
import {SchedulingModule} from "./scheduling/scheduling.module";
import {ScrimModule} from "./scrim/scrim.module";
import {config} from "./util/config";
import { MledbModule } from './mledb/mledb.module';


@Module({
    imports: [
        GraphQLModule.forRoot({
            autoSchemaFile: true,
            installSubscriptionHandlers: true,
            playground: config.gql.playground,
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
        MledbModule,
    ],
    providers: [UserService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(graphqlUploadExpress()).forRoutes("graphql");
    }
}
