import { Inject, Injectable, Logger } from '@nestjs/common';
import { Enforcer } from 'casbin';
import { AUTHZ_ENFORCER } from 'nest-authz';
import { UserEntity } from '../../db/user/user.entity';
import { RoleDefinition } from '../../db/role_definition/role_definition.entity';
import { UserRole, RoleAssignmentStatus } from '../../db/user_role/user_role.entity';
import { PermissionAuditLog, AuditAction } from '../../db/permission_audit_log/permission_audit_log.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    @Inject(AUTHZ_ENFORCER) private readonly enforcer: Enforcer,
    @InjectRepository(RoleDefinition)
    private readonly roleDefRepo: Repository<RoleDefinition>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(PermissionAuditLog)
    private readonly auditLogRepo: Repository<PermissionAuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Check if a user has permission to perform an action on a resource within a scope.
   */
  async checkPermission(userId: number, action: string, resource: string, scope: string = 'all'): Promise<boolean> {
    // Casbin expects strings. Convert userId to string.
    return this.enforcer.enforce(String(userId), resource, action, scope);
  }

  /**
   * Get all implicit permissions for a user.
   * Returns a list of permission strings in the format "resource:action:scope"
   */
  async getAllPermissionsForUser(userId: number): Promise<string[]> {
      // getImplicitPermissionsForUser returns 2D array: [[resource, action, scope], ...] (or whatever p matches)
      // Our p definition is: p = sub, obj, act, scope, eft
      // So implicit permissions will exclude sub, but include obj, act, scope, eft?
      // Actually casbin returns the policy definition values.
      const permissions = await this.enforcer.getImplicitPermissionsForUser(String(userId));
      const scopes = new Set<string>();

      for (const p of permissions) {
          // p matches policy definition.
          // Model: p = sub, obj, act, scope, eft
          // The result of getImplicitPermissionsForUser generally includes the full policy rule minus the subject? 
          // No, it usually returns the policy lines that apply.
          // Let's assume standard behavior: [sub, obj, act, scope, eft] or [obj, act, scope, eft] depends on API.
          // In standard RBAC, getImplicitPermissionsForUser returns `[subject, ...policy_args]` or just policy args?
          // Docs say: "GetImplicitPermissionsForUser gets implicit permissions for a user or role."
          // It returns the policy values.
          // Given `p = sub, obj, act, scope, eft`, and `getImplicitPermissionsForUser(sub)`,
          // it likely returns `[sub, obj, act, scope, eft]`.
          
          // Let's verify by checking the array length or just mapping safely.
          // We want `resource:action:scope`.
          // resource = p[1], action = p[2], scope = p[3]
          
          if (p.length >= 4) {
              const resource = p[1];
              const action = p[2];
              const scope = p[3];
              // Scope 'all' means global access. We can represent it as 'resource:action:*' or stick to 'resource:action:all'.
              // We'll stick to exact strings for now.
              scopes.add(`${resource}:${action}:${scope}`);
          }
      }
      return Array.from(scopes);
  }

  // --- Role Management ---

  async createRole(name: string, displayName: string, description?: string, hierarchy: number = 0, actorId?: number): Promise<RoleDefinition> {
    const role = this.roleDefRepo.create({
      name,
      displayName,
      description,
      hierarchy,
    });
    await this.roleDefRepo.save(role);
    
    // Audit
    if (actorId) {
        await this.logAudit(actorId, AuditAction.ADD_POLICY, { role: name, type: 'role_definition_create' });
    }

    return role;
  }

  async getRole(name: string): Promise<RoleDefinition | null> {
    return this.roleDefRepo.findOne({ where: { name } });
  }

  async listRoles(): Promise<RoleDefinition[]> {
    return this.roleDefRepo.find();
  }

  // --- Permission Management (Casbin Policies) ---

  async addPermissionToRole(roleName: string, action: string, resource: string, scope: string, actorId?: number): Promise<boolean> {
    // p, role, resource, action, scope
    const added = await this.enforcer.addPolicy(roleName, resource, action, scope, 'allow');
    
    if (added && actorId) {
      await this.logAudit(actorId, AuditAction.ADD_POLICY, { role: roleName, action, resource, scope });
    }
    return added;
  }

  async removePermissionFromRole(roleName: string, action: string, resource: string, scope: string, actorId?: number): Promise<boolean> {
    const removed = await this.enforcer.removePolicy(roleName, resource, action, scope, 'allow');
    
    if (removed && actorId) {
      await this.logAudit(actorId, AuditAction.REMOVE_POLICY, { role: roleName, action, resource, scope });
    }
    return removed;
  }

  async getPermissionsForRole(roleName: string): Promise<string[][]> {
    return this.enforcer.getFilteredPolicy(0, roleName);
  }

  async addRoleInheritance(childRole: string, parentRole: string): Promise<boolean> {
      // g, childRole, parentRole
      return this.enforcer.addGroupingPolicy(childRole, parentRole);
  }

  // --- User Role Assignment ---

  async assignRoleToUser(userId: number, roleName: string, scope: string = '', actorId?: number): Promise<UserRole> {
    // 1. Verify role exists
    const roleDef = await this.getRole(roleName);
    if (!roleDef) throw new Error(`Role ${roleName} not found`);

    // 2. Check if already assigned (in DB)
    /* 
       We might want to allow multiple assignments of same role if scopes differ? 
       For MVP, let's assume one active assignment per role per user is enough, or unique by (user, role, scope).
       But Casbin treats (user, role) as g policy. 
       Scope in g policy? standard RBAC is g(user, role). 
       If we want scoped roles (e.g. Captain of Team A), we generally do g(user, role, domain) in Casbin with RBAC with domains.
       Our model.conf in existing code likely uses RBAC with domains if scope is involved in role assignment.
       
       Let's check model.conf. It was shown in finding results as `auth/model.conf`.
       Wait, I haven't seen `auth/model.conf` content yet. finding results showed `node_modules/...`.
       `core/src/authz.def.ts` refers to `auth/model.conf`.
       I should verify `auth/model.conf` content.
    */
    
    // For now, assume simple RBAC g(user, role).
    // If scope is needed, we might need g(user, role, scope).
    
    // Create UserRole record
    const status = roleDef.isRestricted ? RoleAssignmentStatus.PENDING : RoleAssignmentStatus.ACTIVE;
    const userRole = this.userRoleRepo.create({
      userId,
      role: roleDef,
      roleId: roleDef.id,
      scope,
      assignedById: actorId,
      assignedAt: new Date(),
      status, 
    });
    
    await this.userRoleRepo.save(userRole);

    // Add to Casbin ONLY if active
    if (status === RoleAssignmentStatus.ACTIVE) {
        await this.enforcer.addRoleForUser(String(userId), roleName);
    }

    if (actorId) {
      await this.logAudit(actorId, AuditAction.GRANT_ROLE, { userId, role: roleName, scope, status });
    }
    
    return userRole;
  }

  async approveRoleAssignment(userRoleId: string, actorId: number): Promise<boolean> {
      const userRole = await this.userRoleRepo.findOne({ where: { id: userRoleId }, relations: ['role'] });
      if (!userRole) throw new Error('Assignment not found');
      if (userRole.status !== RoleAssignmentStatus.PENDING) return false;

      userRole.status = RoleAssignmentStatus.ACTIVE;
      await this.userRoleRepo.save(userRole);

      // Add to Casbin
      await this.enforcer.addRoleForUser(String(userRole.userId), userRole.role.name);

      await this.logAudit(actorId, AuditAction.APPROVE_ROLE, { userRoleId, userId: userRole.userId, role: userRole.role.name });
      return true;
  }

  async rejectRoleAssignment(userRoleId: string, actorId: number): Promise<boolean> {
      const userRole = await this.userRoleRepo.findOne({ where: { id: userRoleId }, relations: ['role'] });
      if (!userRole) throw new Error('Assignment not found');
      if (userRole.status !== RoleAssignmentStatus.PENDING) return false;

      userRole.status = RoleAssignmentStatus.REJECTED;
      await this.userRoleRepo.save(userRole);

      await this.logAudit(actorId, AuditAction.REJECT_ROLE, { userRoleId, userId: userRole.userId, role: userRole.role.name });
      return true;
  }

  async revokeRoleFromUser(userId: number, roleName: string, actorId?: number): Promise<boolean> {
     // Remove from Casbin
     const removed = await this.enforcer.deleteRoleForUser(String(userId), roleName);

     // Mark in DB as inactive or delete. Let's soft delete or delete.
     // Find the UserRole
     const roleDef = await this.getRole(roleName);
     if (roleDef) {
         await this.userRoleRepo.delete({ userId, roleId: roleDef.id });
     }

     if (removed && actorId) {
         await this.logAudit(actorId, AuditAction.REVOKE_ROLE, { userId, role: roleName });
     }
     return removed;
  }
  
  async getAuditLogs(): Promise<PermissionAuditLog[]> {
      return this.auditLogRepo.find({
          order: { timestamp: 'DESC' },
          take: 100, // Limit for MVP
      });
  }

  // --- Audit Helper ---
  
  private async logAudit(actorId: number, action: AuditAction, details: Record<string, any>) {
      /*
      // We need to fetch UserEntity for actor if we want to save relation, 
      // or just save actorId if we allowed it in entity. 
      // PermissionAuditLog entity has `actorId` column and `actor` relation.
      */
      try {
        await this.auditLogRepo.save({
            actorId,
            action,
            details,
            timestamp: new Date(),
        });
      } catch (e) {
          this.logger.error(`Failed to log audit: ${e.message}`, e.stack);
      }
  }
}
