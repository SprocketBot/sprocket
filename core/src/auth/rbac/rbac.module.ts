import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RoleDefinition } from '../../db/role_definition/role_definition.entity';
import { UserRole } from '../../db/user_role/user_role.entity';
import { PermissionAuditLog } from '../../db/permission_audit_log/permission_audit_log.entity';

import { RbacResolver } from './rbac.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleDefinition, UserRole, PermissionAuditLog]),
  ],
  providers: [RbacService, RbacResolver],
  exports: [RbacService],
})
export class RbacModule {}
