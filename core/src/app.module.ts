import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AUTHZ_ENFORCER, AuthZModule } from 'nest-authz';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { GlobalModule } from './global/global.module';
import type { Request } from 'express';
import { newEnforcer } from 'casbin';
import PostgresAdapter from 'casbin-pg-adapter';
import { BaseSprocketModules, SprocketConfigService } from '@sprocketbot/lib';
import {
  AuthTarget,
  AuthScope,
  AuthAction,
  AuthEffect,
} from '@sprocketbot/lib/types';
import { DbModule } from './db/db.module';
import { GqlModule } from './gql/gql.module';
import { CasbinAuthPolicy } from './auth/constants';
import { MatchmakingConnectorModule } from '@sprocketbot/matchmaking';

@Module({
  imports: [
    ...BaseSprocketModules,
    AuthZModule.register({
      model: 'auth/model.conf',
      policy: 'auth/policy.csv',
      enforcerProvider: {
        provide: AUTHZ_ENFORCER,
        inject: [SprocketConfigService],
        async useFactory(cfg: SprocketConfigService) {
          const logger = new Logger(AuthZModule.name);
          const pgAdapter = await PostgresAdapter.newAdapter({
            migrate: true,
            host: cfg.getOrThrow('pg.host'),
            user: cfg.getOrThrow('pg.username'),
            password: cfg.getOrThrow('pg.password'),
            port: cfg.getOrThrow('pg.port'),
          });

          const enforcer = await newEnforcer('auth/model.conf', pgAdapter);

          // Initial Setup
          // TODO: Set up a super-user configuration method
          // Should use https://casbin.org/docs/rbac-with-pattern to get all permissions
          // Could technically loop through AuthTarget AuthAction and AuthScope to get all permissions, but that feels extreme.
          const defaultPolicy: CasbinAuthPolicy[] = [
            [
              'superuser',
              'Sprocket',
              AuthTarget.VIEW_GQL_PLAYGROUND,
              AuthAction.Read,
              AuthScope.ALL,
              AuthEffect.Allow,
            ],
            [
              'superuser',
              'Sprocket',
              AuthTarget.VIEW_ROLE_CONFIG,
              AuthAction.Admin,
              AuthScope.ALL,
              AuthEffect.Allow,
            ],
          ];
          await Promise.all(defaultPolicy.map((v) => enforcer.addPolicy(...v)));

          const initialAdmins = cfg.getOrThrow('initialAdmins');
          if (Array.isArray(initialAdmins)) {
            await Promise.all(
              initialAdmins.map(async (username) => {
                if (
                  await enforcer.addRoleForUser(
                    username.toString(),
                    'superuser',
                    'Sprocket',
                  )
                ) {
                  logger.warn(`"${username}" was made a superuser`);
                }
              }),
            );
          } else if (initialAdmins) {
            logger.warn(
              'Config value for "initialAdmins" was provided, but is not an array. It will be ignored',
            );
          }

          return enforcer;
        },
      },
      usernameFromContext: (ctx) =>
        ctx.switchToHttp().getRequest<Request>().user.username,
    }),
    PassportModule,
    AuthModule,
    GlobalModule,
    DbModule,
    GqlModule,
    MatchmakingConnectorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
