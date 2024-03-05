import { Inject, Injectable, Logger } from '@nestjs/common';
import { Enforcer } from 'casbin';
import { AUTHZ_ENFORCER } from 'nest-authz';
import { AuthScope, AuthorizationSpec } from '../constants';
import type { Request } from 'express';

@Injectable()
export class AuthorizeService {
  private readonly logger = new Logger(AuthorizeService.name);
  constructor(
    @Inject(AUTHZ_ENFORCER)
    private readonly enforcer: Enforcer,
  ) {}

  async check(
    user: Express.User,
    auth: AuthorizationSpec,
    req: Request, // TODO: Should this be a specific context that isn't depending on the express Request type?
    organization: string = 'Sprocket',
  ) {
    const hasPerm = await this.enforcer.enforce(
      user.username,
      auth.target,
      `${auth.action}:${auth.scope}`,
      organization,
    );
    if (!hasPerm) return hasPerm;
    if (AuthScope.ALL === auth.scope) return true;

    if (!auth.inScope) {
      this.logger.debug(
        `Authorization has "${auth.scope}" scope, but does not have "inScope" to validate. This will always deny`,
      );
      return false;
    } else return auth.inScope(user, req);
  }
}
