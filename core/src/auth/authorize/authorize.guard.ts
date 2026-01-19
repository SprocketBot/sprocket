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
    private readonly logger = new Logger(_AuthorizeGuard.name);
    constructor(
      private readonly authenticateService: AuthenticateService,
      private readonly authService: AuthorizeService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      // Extract the user from the request
      const req: Request = getRequestFromContext(context);

      const user = await this.authenticateService.getUserFromRequest(req);

      if (!user) return false;
      req.user = user;

      if (authorizations.length === 0)
        return Boolean(user) /* Must be signed in */;

      try {
        // Check each authorization requirement
        for (const auth of authorizations) {
          // Handle Resolvable type - can be direct AuthorizationSpec, Promise, or function
          let resolvedAuth: AuthorizationSpec;

          if (typeof auth === 'function') {
            const result = auth();
            resolvedAuth = result instanceof Promise ? await result : result;
          } else if (auth instanceof Promise) {
            resolvedAuth = await auth;
          } else {
            resolvedAuth = auth;
          }

          // Use the enhanced AuthorizeService to check permission
          const hasPermission = await this.authService.check(
            user,
            resolvedAuth.action,
            'default' // Default resource, can be customized per auth
          );

          if (!hasPermission) {
            this.logger.warn(`User ${user.id} lacks permission for action ${resolvedAuth.action}`);
            return false;
          }
        }

        return true;
      } catch (error) {
        this.logger.error(`Authorization check failed: ${error.message}`, error.stack);
        return false;
      }
    }
  }
  return _AuthorizeGuard;
};
