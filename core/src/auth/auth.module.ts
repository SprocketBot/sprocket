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

@Module({
  imports: [PassportModule.register({ session: false }), DbModule, RbacModule],
  providers: [
    AuthorizeService,
    AuthenticateService,
    DiscordStrategyService,
    SteamStrategyService,
  ],
  exports: [AuthorizeService, AuthenticateService, RbacModule],
  controllers: [
    AuthController,
    DiscordStrategyController,
    SteamStrategyController,
  ],
})
export class AuthModule {}
