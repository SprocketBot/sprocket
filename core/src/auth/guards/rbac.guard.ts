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
    const permissions = this.reflector.get<any[]>('permissions', context.getHandler());
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
    
    const perm = permissions[0];
    let resource, action, scope = 'all';

    if (typeof perm === 'string') {
        resource = perm;
        action = permissions[1];
    } else {
        // Assume object structure from nest-authz
        resource = perm.resource;
        action = perm.action;
        // Scope might be in possession or separate?
        // nest-authz uses possession. 
        // For now default scope 'all' is fine.
    }
    
    // If API Token is present, enforce its scopes first
    // Token scopes are strings like "resource:action:scope" or "*"
    if (user && (user as any).apiToken) {
        // We need to access apiToken from request. 
        // In GqlAuthGuard/ApiTokenGuard we attached apiToken to request. Use that if available.
        // It should be on the same object as user if we attached it to request.
        // However, `user` here is `request.user`. The token is `request.apiToken`.
        // Let's get the request object again to access apiToken.
        let req;
        if (context.getType() === 'http') {
            req = context.switchToHttp().getRequest();
        } else if ((context.getType() as string) === 'graphql') {
            const ctx = GqlExecutionContext.create(context);
            req = ctx.getContext().request;
        }

        if (req && req.apiToken) {
            const requiredScope = `${resource}:${action}:${scope}`;
            const tokenScopes = req.apiToken.scopes as string[];

            // Check if token has * or exact scope match
            const hasScope = tokenScopes.includes('*') || tokenScopes.includes(requiredScope);
            
            if (!hasScope) {
                 this.logger.warn(`API Token ${req.apiToken.id} denied access to ${requiredScope}`);
                 return false;
            }
        }
    }

    return this.rbacService.checkPermission(user.id, action, resource, scope);
  }
}
