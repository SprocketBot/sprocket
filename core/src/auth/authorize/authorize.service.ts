import { Inject, Injectable, Logger } from '@nestjs/common';
import { Enforcer } from 'casbin';
import { AUTHZ_ENFORCER } from 'nest-authz';
import { type User } from '@sprocketbot/lib/types';
import { UserRepository } from '../../db/user/user.repository';

@Injectable()
export class AuthorizeService {
  private readonly logger = new Logger(AuthorizeService.name);
  constructor(
    @Inject(AUTHZ_ENFORCER)
    private readonly enforcer: Enforcer,
    private readonly userRepo: UserRepository,
  ) { }

  async getAllRoles() {
    return this.enforcer.getAllRoles();
  }

  async addUserToRole(role: string, userId: User['id']) {
    const user = await this.userRepo.findBy({ id: userId });
    if (!user) throw new Error(`User ${userId} not found!`);
    const allRoles = await this.getAllRoles();
    if (!allRoles.includes(role)) {
      throw new Error(
        `Role ${role} not found! (Available Roles: ${JSON.stringify(allRoles)})`,
      );
    }
    await this.enforcer.addRoleForUser(userId, role);
    return true;
  }

  async check(user: Pick<User, 'id'>, action: string, resource: string): Promise<boolean> {
    this.logger.log(`Checking authorization for user ${user.id} - action: ${action}, resource: ${resource}`);

    try {
      // Convert user ID to number for RBAC service
      const userId = parseInt(user.id, 10);
      if (isNaN(userId)) {
        this.logger.error(`Invalid user ID format: ${user.id}`);
        return false;
      }

      // Use the RBAC service to check permission
      return await this.checkPermission(userId, action, resource);
    } catch (error) {
      this.logger.error(`Authorization check failed for user ${user.id}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Check if a user has permission to perform an action on a resource.
   * This is a wrapper around the RBAC service for consistency.
   */
  async checkPermission(userId: number, action: string, resource: string): Promise<boolean> {
    // For now, we'll implement a basic check. This can be enhanced later
    // to support more complex authorization scenarios.

    // Get all permissions for the user
    const permissions = await this.getAllPermissionsForUser(userId);

    // Check if the user has the specific permission
    const requiredPermission = `${resource}:${action}`;
    const hasPermission = permissions.includes(requiredPermission);

    this.logger.log(`User ${userId} permission check: ${requiredPermission} = ${hasPermission}`);
    return hasPermission;
  }

  /**
   * Get all permissions for a user by checking their roles.
   */
  async getAllPermissionsForUser(userId: number): Promise<string[]> {
    try {
      // Get implicit permissions from Casbin
      const permissions = await this.enforcer.getImplicitPermissionsForUser(String(userId));
      const scopes = new Set<string>();

      for (const p of permissions) {
        if (p.length >= 3) {
          const resource = p[1];
          const action = p[2];
          scopes.add(`${resource}:${action}`);
        }
      }

      this.logger.log(`User ${userId} has permissions: ${Array.from(scopes).join(', ')}`);
      return Array.from(scopes);
    } catch (error) {
      this.logger.error(`Failed to get permissions for user ${userId}: ${error.message}`, error.stack);
      return [];
    }
  }
}

/*
@Injectable()
export class LegacyAuthorizeService {
  private readonly logger = new Logger(LegacyAuthorizeService.name);
  constructor(
    @Inject(AUTHZ_ENFORCER)
    private readonly enforcer: Enforcer,
  ) {}

  private buildAuthMatrix(spec: AuthorizationSpec): AuthorizationSpec[] {
    const output = [spec];
    const isAdmin = spec.action === AuthAction.Admin;
    const isAll = spec.scope === AuthScope.ALL;
    if (!isAdmin) output.push({ ...spec, action: AuthAction.Admin });
    if (!isAll) output.push({ ...spec, scope: AuthScope.ALL });
    if (!isAdmin && !isAll)
      output.push({ ...spec, action: AuthAction.Admin, scope: AuthScope.ALL });
    return output;
  }

  async check(
    user: User,
    auth: AuthorizationSpec,
    req: Request, // TODO: Should this be a specific context that isn't depending on the express Request type?
    organization: string = 'Sprocket',
  ) {
    const matrix: AuthorizationSpec[] = this.buildAuthMatrix(auth);
    const matchedPerm = await matrix.reduce<Promise<AuthorizationSpec | false>>(
      async (acc, p) => {
        if (await acc) return await acc;
        else if (
          await this.enforcer.enforce(
            user.username,
            organization,
            p.target,
            p.action,
            p.scope,
          )
        ) {
          return p;
        }
        return false;
      },
      Promise.resolve(false),
    );

    if (!matchedPerm) return matchedPerm;
    if (AuthScope.ALL === matchedPerm.scope) return true;

    if (!auth.inScope) {
      this.logger.debug(
        `Authorization has "${auth.scope}" scope, but does not have "inScope" to validate. This will always deny`,
      );
      return false;
    } else return auth.inScope(user, req);
  }

  async getPermissions(user: User): Promise<AuthorizationSpec[]> {
    const permissions = new Set(
      (
        await this.enforcer.getImplicitPermissionsForUser(
          user.username,
          'Sprocket',
        )
      ).map((v) => v.slice(1)),
    );

    const auths: AuthorizationSpec[] = [...permissions].map(
      ([, _object, _action, scope]): AuthorizationSpec => {
        const object = toAuthTarget(_object);
        const action = toAuthAction(_action);
        if (!isAuthScope(scope)) {
          throw new Error();
        }

        return {
          target: object,
          action: action,
          scope: scope,
        } as AuthorizationSpec;
      },
    );

    return auths;
  }

  async getAllRoles(tenant: 'Sprocket' = 'Sprocket'): Promise<string[]> {
    const allRoles: Set<string> = (
      await this.enforcer.getGroupingPolicy()
    ).reduce((acc, [, gRole, gTenant]) => {
      if (tenant === gTenant) acc.add(gRole);
      return acc;
    }, new Set<string>());
    return Array.from(allRoles);
  }

  async getActionsForRole(
    role: string,
    tenant: 'Sprocket' = 'Sprocket',
  ): Promise<AuthorizationSpec[]> {
    const permissions = new Set(
      (await this.enforcer.getImplicitPermissionsForUser(role, tenant)).map(
        (v) => v.slice(1),
      ),
    );

    const auths: AuthorizationSpec[] = [...permissions].map(
      ([, _object, _action, scope]): AuthorizationSpec => {
        const object = toAuthTarget(_object);
        const action = toAuthAction(_action);
        if (!isAuthScope(scope)) throw new Error();

        return {
          target: object,
          action: action,
          scope: scope,
        } as AuthorizationSpec;
      },
    );

    return auths;
  }
}
*/
