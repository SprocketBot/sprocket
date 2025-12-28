import { Module } from '@nestjs/common';
import { AuthorizeService } from './authorize/authorize.service';
import { AuthController } from './auth.controller';
import { AuthenticateService } from './authenticate/authenticate.service';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategyController } from './strategies/discord-strategy/discord-strategy.controller';
import { DiscordStrategyService } from './strategies/discord-strategy/discord-strategy.service';
import { DbModule } from '../db/db.module';
import { SteamStrategyController } from './strategies/steam-strategy/steam-strategy.controller';
import { SteamStrategyService } from './strategies/steam-strategy/steam-strategy.service';
import { RbacModule } from './rbac/rbac.module';
import { ApiTokenService } from './api_token/api_token.service';
import { ApiTokenResolver } from './api_token/api_token.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiTokenEntity } from '../db/api_token/api_token.entity';
import { ApiTokenUsageLogEntity } from '../db/api_token/api_token_usage_log.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiTokenUsageInterceptor } from './api_token/api_token_usage.interceptor';

@Module({
  imports: [
      PassportModule.register({ session: false }),
      DbModule,
      RbacModule,
      TypeOrmModule.forFeature([ApiTokenEntity, ApiTokenUsageLogEntity]),
  ],
  providers: [
    AuthorizeService,
    AuthenticateService,
    DiscordStrategyService,
    SteamStrategyService,
    ApiTokenService,
    ApiTokenResolver,
  ],
  exports: [AuthorizeService, AuthenticateService, RbacModule, ApiTokenService],
  controllers: [
    AuthController,
    DiscordStrategyController,
    SteamStrategyController,
  ],
})
export class AuthModule {}
