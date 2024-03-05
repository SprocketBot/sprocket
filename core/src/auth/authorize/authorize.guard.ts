import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthorizationInput, AuthorizationSpec } from '../constants';
import type { Request } from 'express';
import { AuthorizeService } from './authorize.service';

@Injectable()
export class AuthorizeGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizeGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthorizeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get authorizations from '@Authorized' decorator
    const authorizations = this.reflector.get<AuthorizationInput[] | undefined>(
      'authorize',
      context.getHandler(),
    );

    if (!authorizations) {
      this.logger.error(
        'AuthorizeGuard must be accompanied by the @Authorize() decorator to function correctly.',
      );
    }

    // Extract the user from the request
    const req: Request = context.switchToHttp().getRequest();
    const { user } = req;

    if (authorizations.length === 0)
      return Boolean(user) /* Must be signed in */;

    return await Promise.all(
      // Iterate over all authorization objects
      // They all need to match.
      authorizations.map(async (authIn: AuthorizationInput) => {
        const auth: AuthorizationSpec =
          typeof authIn === 'function' ? await authIn() : await authIn;
        return await this.authService.check(user, auth, req);
      }),
    ).then((v) => v.every(Boolean));
  }
}
