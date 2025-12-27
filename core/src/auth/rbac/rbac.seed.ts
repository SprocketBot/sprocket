import { Logger } from '@nestjs/common';
import { Seed, type Seeder } from '../../db/seeder.decorator';
import { RbacService } from './rbac.service';
import { EntityManager } from 'typeorm';

@Seed()
export class RbacSeed implements Seeder {
  private readonly logger = new Logger(RbacSeed.name);

  constructor(private readonly rbacService: RbacService) {}

  async seed(em: EntityManager): Promise<void> {
      this.logger.log('Seeding RBAC Roles and Policies...');

      const roles = [
        { name: 'player', displayName: 'Player', hierarchy: 0, description: 'Standard user' },
        { name: 'captain', displayName: 'Team Captain', hierarchy: 1, description: 'Manages team roster and schedule' },
        { name: 'general_manager', displayName: 'General Manager', hierarchy: 2, description: 'Manages club (multiple teams)' },
        { name: 'franchise_manager', displayName: 'Franchise Manager', hierarchy: 3, description: 'Manages franchise (multiple clubs)', isRestricted: true },
        { name: 'league_ops', displayName: 'League Ops', hierarchy: 4, description: 'League operations staff', isRestricted: true },
        { name: 'admin', displayName: 'Admin', hierarchy: 5, description: 'Full system access', isRestricted: true },
      ];

      for (const r of roles) {
        let role = await this.rbacService.getRole(r.name);
        if (!role) {
          this.logger.log(`Creating role: ${r.name}`);
          role = await this.rbacService.createRole(r.name, r.displayName, r.description, r.hierarchy);
        }
        
        if (role.isRestricted !== !!r.isRestricted) {
            role.isRestricted = !!r.isRestricted;
            await role.save();
        }
      }

      // Define MVP Policies
      const policies = [
        { role: 'player', action: 'read', resource: 'profile', scope: 'own' },
        { role: 'player', action: 'write', resource: 'profile', scope: 'own' },
        { role: 'captain', action: 'read', resource: 'roster', scope: 'own_team' },
        { role: 'captain', action: 'manage', resource: 'roster', scope: 'own_team' },
        { role: 'admin', action: '*', resource: '*', scope: 'all' },
      ];

      for (const p of policies) {
         await this.rbacService.addPermissionToRole(p.role, p.action, p.resource, p.scope);
      }
      
      this.logger.log('Seeding RBAC Role Inheritance...');
      // Admin > League Ops > Franchise Manager > GM > Captain > Player
      const hierarchy = [
          ['admin', 'league_ops'],
          ['league_ops', 'franchise_manager'],
          ['franchise_manager', 'general_manager'],
          ['general_manager', 'captain'],
          ['captain', 'player'],
      ];
      
      for (const [parent, child] of hierarchy) {
          // Inheritance: child has parent permissions? 
          // Definition: "Higher roles inherit permissions from lower roles (e.g., Admin can do everything League Ops can do)."
          // So Admin (higher) inherits League Ops (lower).
          // g(admin, league_ops).
          // Admin is "user" in g(u,r) sense if we think of role hierarchy.
          // Casbin: g(u, r). u has r's permissions.
          // So if Admin has League Ops permissions, we need g(admin, league_ops).
          // Yes.
          await this.rbacService.addRoleInheritance(parent, child);
      }
      
      this.logger.log('RBAC Seeding Complete.');
  }
}
