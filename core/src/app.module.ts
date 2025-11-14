import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { GlobalModule } from './global/global.module';
import { BaseSprocketModules } from '@sprocketbot/lib';
import { DbModule } from './db/db.module';
import { GqlModule } from './gql/gql.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { HealthModule } from './health/health.module';
import { authz } from './authz.def';
import { ObservabilityModule } from './observability/observability.module';

@Module({
  imports: [
    ...BaseSprocketModules,
    authz,
    PassportModule,
    ScheduleModule.forRoot(),
    AuthModule,
    GlobalModule,
    DbModule,
    GqlModule,
    MatchmakingModule,
    HealthModule,
    ObservabilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
