import { Module } from '@nestjs/common';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { DbModule } from '../db/db.module';
import { AuthModule } from '../auth/auth.module';
import { ScrimResolver } from './scrim/scrim.resolver';
import { UserResolver } from './user/user.resolver';
import { MatchmakingConnectorModule } from '@sprocketbot/matchmaking';
import { PlayerResolver } from './player/player.resolver';
import { UserAuthAccountResolver } from './user_auth_account/user_auth_account.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': false,
        'subscriptions-transport-ws': {
          onConnect(_, ws) {
            return { req: ws.upgradeReq };
          },
        },
      },
      autoSchemaFile: true,
      csrfPrevention: false,
      introspection: true,
      context: ({ req, res }) => {
        // console.log(req)
        return {
          request: req,
          response: res,
        };
      },
      playground: {
        title: 'Sprocket GraphQL Playground',
        settings: {
          'tracing.hideTracingResponse': true,
          'request.credentials': 'include',
        },
      },
      includeStacktraceInErrorResponses: true, // TODO: False in prod
    }),
    DbModule,
    AuthModule,
    MatchmakingConnectorModule,
  ],
  providers: [
    ScrimResolver,
    UserResolver,
    PlayerResolver,
    UserAuthAccountResolver,
  ],
})
export class GqlModule {}
