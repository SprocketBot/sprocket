import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthenticateService } from '../authenticate/authenticate.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private readonly authenticateService: AuthenticateService) {}
  canActivate(context: ExecutionContext): boolean {
    const redirToLogin = () => {
      response.clearCookie('auth');
      response
        .status(HttpStatus.TEMPORARY_REDIRECT)
        .location('/oauth/callback/discord');

      response.send();
      return false;
    };

    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    const user = this.authenticateService.requestHasValidToken(request);
    if (user) {
      request.user = user;
      return true;
    } else {
      return redirToLogin();
    }
  }
}
