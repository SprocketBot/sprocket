import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { GlobalModule } from './global/global.module';
import { BaseSprocketModules } from '@sprocketbot/lib';
import { DbModule } from './db/db.module';
import { GqlModule } from './gql/gql.module';
import { MatchmakingConnectorModule } from '@sprocketbot/matchmaking';
import { HealthModule } from './health/health.module';
import { authz } from './authz.def';
import { ObservabilityModule } from './observability/observability.module';

@Module({
  imports: [
    ...BaseSprocketModules,
    authz,
    PassportModule,
    AuthModule,
    GlobalModule,
    DbModule,
    GqlModule,
    MatchmakingConnectorModule,
    HealthModule,
    ObservabilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
