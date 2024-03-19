import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class DiscordStrategyGuard extends AuthGuard('discord') {
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    return {
      successReturnToOrRedirect: '/',
      failureRedirect: 'https://google.com',
    };
  }
}
