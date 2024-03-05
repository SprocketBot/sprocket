import { Module } from '@nestjs/common';
import { AuthorizeService } from './authorize/authorize.service';
import { AuthController } from './auth.controller';
import { AuthenticateService } from './authenticate/authenticate.service';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategyController } from './strategies/discord-strategy/discord-strategy.controller';
import { DiscordStrategyService } from './strategies/discord-strategy/discord-strategy.service';

@Module({
  imports: [PassportModule.register({ session: false })],
  providers: [AuthorizeService, AuthenticateService, DiscordStrategyService],
  exports: [AuthorizeService, AuthenticateService],
  controllers: [AuthController, DiscordStrategyController],
})
export class AuthModule {}
