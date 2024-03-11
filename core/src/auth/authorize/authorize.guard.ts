import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

import { AuthorizationInput, AuthorizationSpec } from '../constants';
import type { Request } from 'express';
import { AuthorizeService } from './authorize.service';
import { getRequestFromContext } from '../../utils/getRequestFromContext';
import { AuthenticateService } from '../authenticate/authenticate.service';

export const AuthorizeGuard = (...authorizations: AuthorizationInput[]) => {
  @Injectable()
  class _AuthorizeGuard implements CanActivate {
    private readonly logger = new Logger(AuthorizeGuard.name);
    constructor(
      private readonly authenticateService: AuthenticateService,
      private readonly authService: AuthorizeService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      // Extract the user from the request
      const req: Request = getRequestFromContext(context);
      const user = this.authenticateService.getUserFromRequest(req);
      if (!user) return false;
      req.user = user;

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
  return _AuthorizeGuard;
};
