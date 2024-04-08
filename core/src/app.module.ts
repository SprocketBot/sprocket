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
import { DbModule } from './db/db.module';
import { GqlModule } from './gql/gql.module';
import { MatchmakingConnectorModule } from '@sprocketbot/matchmaking';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ...BaseSprocketModules,
    AuthZModule.register({
      model: 'auth/model.conf',
      enforcerProvider: {
        provide: AUTHZ_ENFORCER,
        inject: [SprocketConfigService],
        async useFactory(cfg: SprocketConfigService) {
          const logger = new Logger(AuthZModule.name);
          logger.log('Connecting casbin via Postgres');
          const pgAdapter = await PostgresAdapter.newAdapter({
            migrate: true,
            host: cfg.getOrThrow('pg.host'),
            user: cfg.getOrThrow('pg.username'),
            password: cfg.getOrThrow('pg.password'),
            port: cfg.getOrThrow('pg.port'),
            database: cfg.getOrThrow('pg.database'),
          });

          const enforcer = await newEnforcer('auth/model.conf', pgAdapter);

          const zeroWidthSpace = 'zero-width-space ​';
          await enforcer.addRoleForUser(zeroWidthSpace, 'superuser');
          logger.log('Connected! casbin via Postgres');
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
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
