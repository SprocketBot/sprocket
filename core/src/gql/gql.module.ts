import { Module } from '@nestjs/common';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from '../db/db.module';
import { AuthModule } from '../auth/auth.module';
import {
  ScrimParticipantResolver,
  ScrimResolver,
} from './scrim/scrim.resolver';
import { UserResolver } from './user/user.resolver';
import { MatchmakingConnectorModule } from '../matchmaking/connector/matchmaking.connector';
import { QueueModule } from '../matchmaking/queue/queue.module';
import { PlayerResolver } from './player/player.resolver';
import { UserAuthAccountResolver } from './user_auth_account/user_auth_account.resolver';
import { GameResolver } from './game/game.resolver';
import { SkillGroupResolver } from './skill_group/skill_group.resolver';
import { QueueResolver } from './queue/queue.resolver';
import { PubSubProvider } from './constants';
import { PubSub } from 'graphql-subscriptions';
import { ScrimSubscriber } from './scrim/scrim.subscriber';
import { EventsModule } from '@sprocketbot/lib';
import { GameModeResolver } from './game_mode/game_mode.resolver';
import opentelemetry from '@opentelemetry/api';
import { GraphQLResolveInfo } from 'graphql';
import { ScrimService } from './scrim/scrim.service';
import { FranchiseResolver } from './franchise/franchise.resolver';
import { FranchiseRoleResolver } from './franchise/franchise-role.resolver';
import { ClubResolver } from './club/club.resolver';
import { ClubRoleResolver } from './club/club-role.resolver';
import { TeamResolver } from './team/team.resolver';
import { TeamRoleResolver } from './team/team-role.resolver';
import { BulkResolver } from './bulk/bulk.resolver';
import { CoreEntitiesResolver } from './core_entities.resolver';
import {
  MatchSubmissionEntity,
  RoundEntity,
  ScheduleGroupEntity,
  ScheduleGroupTypeEntity,
  TeamStatEntity,
  ScrimQueueEntity,
  ScrimTimeoutEntity,
  EventQueue,
  MetricsEntity,
  LogsEntity,
  MatchEntity,
  UserNotificationPreferenceEntity,
  NotificationHistoryEntity,
  NotificationTemplateEntity,
  PlayerStatEntity,
  UserAuthAccountEntity,
  FixtureEntity,
} from '../db/internal';
import { SeasonResolver } from './season/season.resolver';
import { SeasonService } from './season/season.service';
import { RosterResolver } from './roster/roster.resolver';
import { RosterService } from './roster/roster.service';
import { BulkModule } from '../bulk/bulk.module';
import { AuditModule } from '../audit/audit.module';

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
      autoSchemaFile: 'schema.gql',
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
    QueueModule,
    EventsModule,
    BulkModule,
    AuditModule,
    TypeOrmModule.forFeature([
      MatchSubmissionEntity,
      RoundEntity,
      ScheduleGroupEntity,
      ScheduleGroupTypeEntity,
      TeamStatEntity,
      ScrimQueueEntity,
      ScrimTimeoutEntity,
      EventQueue,
      MetricsEntity,
      LogsEntity,
      MatchEntity,
      UserNotificationPreferenceEntity,
      NotificationHistoryEntity,
      NotificationTemplateEntity,
      PlayerStatEntity,
      UserAuthAccountEntity,
      FixtureEntity,
    ]),
  ],
  providers: [
    ScrimResolver,
    ScrimParticipantResolver,
    UserResolver,
    PlayerResolver,
    UserAuthAccountResolver,
    GameResolver,
    SkillGroupResolver,
    QueueResolver,
    {
      provide: PubSubProvider,
      useValue: new PubSub(),
    },
    ScrimSubscriber,
    GameModeResolver,
    ScrimService,
    CoreEntitiesResolver,
    SeasonResolver,
    SeasonService,
    RosterResolver,
    RosterService,
    FranchiseResolver,
    FranchiseRoleResolver,
    ClubResolver,
    ClubRoleResolver,
    TeamResolver,
    TeamRoleResolver,
    BulkResolver,
  ],
})
export class GqlModule { }
