import { Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class SteamStrategyGuard extends AuthGuard('steam') {
  getAuthenticateOptions(): IAuthModuleOptions {
    return {
      successReturnToOrRedirect: '/',
      failureRedirect: 'https://google.com',
    };
  }
}
