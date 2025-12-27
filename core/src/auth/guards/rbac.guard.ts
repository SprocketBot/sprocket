import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RbacService } from '../rbac/rbac.service';
import { AUTHZ_ENFORCER } from 'nest-authz';
import { Enforcer } from 'casbin';
import { Inject } from '@nestjs/common';

@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!permissions) {
      return true; // No permissions required
    }

    // Get user from context
    // Handle both REST and GraphQL
    let user;
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      user = request.user;
    } else if ((context.getType() as string) === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      user = ctx.getContext().req.user;
    }

    if (!user) {
      this.logger.warn('No user found in context for RBAC check');
      return false;
    }

    // Permissions: [resource, action, scope?]
    // We expect basic 'resource', 'action'. Scope is usually determined dynamically or static 'all'.
    // If decorator is @UsePermissions('roster', 'read'), we check default scope 'all' or 'own'?
    // Usually scopes are dynamic.
    // For Admin UI, we might use 'all' scope for admin endpoints.
    
    // Simplification for now: permissions[0] = resource, permissions[1] = action.
    // We check against 'all' scope by default for admin actions? Or check if ANY scope allows?
    // RbacService.checkPermission(userId, action, resource, scope)
    
    const [resource, action] = permissions;
    const scope = 'all'; // Default for simple guard usage. Dynamic scopes require more complex guard.
    
    return this.rbacService.checkPermission(user.id, action, resource, scope);
  }
}
