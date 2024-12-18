import { Module } from '@nestjs/common';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { DbModule } from '../db/db.module';
import { AuthModule } from '../auth/auth.module';
import {
  ScrimParticipantResolver,
  ScrimResolver,
} from './scrim/scrim.resolver';
import { UserResolver } from './user/user.resolver';
import { MatchmakingConnectorModule } from '@sprocketbot/matchmaking';
import { PlayerResolver } from './player/player.resolver';
import { UserAuthAccountResolver } from './user_auth_account/user_auth_account.resolver';
import { GameResolver } from './game/game.resolver';
import { SkillGroupResolver } from './skill_group/skill_group.resolver';
import { PubSubProvider } from './constants';
import { PubSub } from 'graphql-subscriptions';
import { ScrimSubscriber } from './scrim/scrim.subscriber';
import { EventsModule } from '@sprocketbot/lib';
import { GameModeResolver } from './game_mode/game_mode.resolver';
import opentelemetry from '@opentelemetry/api';
import { GraphQLResolveInfo } from 'graphql';
import { ScrimService } from './scrim/scrim.service';
import { ResolverLibService } from './resolver-lib/resolver-lib.service';
import { MetricsResolver } from './metrics/metrics.resolver';
import { ScheduleGroupTypeResolver } from './scheduling/schedule_group_type/schedule_group_type.resolver';
import { ScheduleGroupResolver } from './scheduling/schedule_group/schedule_group.resolver';
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
      buildSchemaOptions: {
        fieldMiddleware: [
          async (ctx: MiddlewareContext, next: NextFn) => {
            const tracer = opentelemetry.trace.getTracer('');
            function getPath(path: GraphQLResolveInfo['path']) {
              if (path.prev) {
                return `${getPath(path.prev)}.${path.key}`;
              } else {
                return path.key;
              }
            }
            return tracer.startActiveSpan(
              `Resolve: ${getPath(ctx.info.path)}`,
              async (lockSpan) => {
                try {
                  return await next();
                } catch (e) {
                  lockSpan.recordException(e);
                  throw e;
                } finally {
                  lockSpan.end();
                }
              },
            );
          },
        ],
      },
      includeStacktraceInErrorResponses: true, // TODO: False in prod
    }),
    DbModule,
    AuthModule,
    MatchmakingConnectorModule,
    EventsModule,
  ],
  providers: [
    ScrimResolver,
    ScrimParticipantResolver,
    UserResolver,
    PlayerResolver,
    UserAuthAccountResolver,
    GameResolver,
    SkillGroupResolver,
    {
      provide: PubSubProvider,
      useValue: new PubSub(),
    },
    ScrimSubscriber,
    GameModeResolver,
    ScrimService,
    ResolverLibService,
    MetricsResolver,
    ScheduleGroupTypeResolver,
    ScheduleGroupResolver,
  ],
})
export class GqlModule {}
