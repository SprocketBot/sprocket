import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { Role, UserRoleAssignment, Permission, PermissionAuditLog } from './rbac.model';
import { RoleDefinition } from '../../db/role_definition/role_definition.entity';

@Resolver()
export class RbacResolver {
  constructor(private readonly rbacService: RbacService) { }

  @Query(() => [Role])
  // @UseGuards(GqlAuthGuard)
  // @UsePermissions('rbac', 'read')
  async roles(): Promise<RoleDefinition[]> {
    return this.rbacService.listRoles();
  }

  @Query(() => Role, { nullable: true })
  async role(@Args('name') name: string): Promise<RoleDefinition | null> {
    return this.rbacService.getRole(name);
  }

  @Query(() => [Permission])
  async rolePermissions(@Args('role') role: string): Promise<Permission[]> {
    const policy = await this.rbacService.getPermissionsForRole(role);
    // Policy is [sub, obj, act, scope, eft] (from model.conf) or [sub, obj, act, scope] depending on storage
    // Casbin's getFilteredPolicy returns array of strings. 
    // If stored policy has explicit effect, it might be returned.
    // Our model: p = sub, obj, act, scope, eft
    return policy.map(p => ({
      role: p[0],
      resource: p[1],
      action: p[2],
      scope: p[3],
      effect: p[4] || 'allow',
    }));
  }

  @Query(() => [PermissionAuditLog])
  async permissionAuditLogs(): Promise<PermissionAuditLog[]> {
    return this.rbacService.getAuditLogs();
  }

  @Mutation(() => Role)
  async createRole(
    @Args('name') name: string,
    @Args('displayName') displayName: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('hierarchy', { type: () => Int, defaultValue: 0 }) hierarchy?: number,
  ): Promise<RoleDefinition> {
    // TODO: Get actorId from context
    return this.rbacService.createRole(name, displayName, description, hierarchy);
  }

  @Mutation(() => Boolean)
  async addPermissionToRole(
    @Args('role') role: string,
    @Args('resource') resource: string,
    @Args('action') action: string,
    @Args('scope', { defaultValue: 'all' }) scope: string,
  ): Promise<boolean> {
    return this.rbacService.addPermissionToRole(role, action, resource);
  }

  @Mutation(() => Boolean)
  async removePermissionFromRole(
    @Args('role') role: string,
    @Args('resource') resource: string,
    @Args('action') action: string,
    @Args('scope', { defaultValue: 'all' }) scope: string,
  ): Promise<boolean> {
    return this.rbacService.removePermissionFromRole(role, action, resource);
  }

  @Mutation(() => UserRoleAssignment)
  async assignRoleToUser(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('role') role: string,
    @Args('scope', { nullable: true }) scope?: string,
  ): Promise<UserRoleAssignment> {
    // TODO: actorId
    const assignment = await this.rbacService.assignRoleToUser(userId, role);
    // Map entity to GQL type if needed, but fields align mostly
    return assignment as any;
  }

  @Mutation(() => Boolean)
  async revokeRoleFromUser(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('role') role: string,
  ): Promise<boolean> {
    return this.rbacService.revokeRoleFromUser(userId, role);
  }
}
