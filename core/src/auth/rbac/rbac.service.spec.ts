import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from './rbac.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleDefinition } from '../../db/role_definition/role_definition.entity';
import { UserRole } from '../../db/user_role/user_role.entity';
import { PermissionAuditLog } from '../../db/permission_audit_log/permission_audit_log.entity';
import { AUTHZ_ENFORCER } from 'nest-authz';
import { DataSource } from 'typeorm';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockRepository = {
  create: vi.fn(),
  save: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  delete: vi.fn(),
};

const mockEnforcer = {
  enforce: vi.fn(),
  addPolicy: vi.fn(),
  removePolicy: vi.fn(),
  getFilteredPolicy: vi.fn(),
  addRoleForUser: vi.fn(),
  deleteRoleForUser: vi.fn(),
  addGroupingPolicy: vi.fn(),
};

describe('RbacService', () => {
  let service: RbacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: getRepositoryToken(RoleDefinition),
          useValue: mockRepository,
        },
        { provide: getRepositoryToken(UserRole), useValue: mockRepository },
        {
          provide: getRepositoryToken(PermissionAuditLog),
          useValue: mockRepository,
        },
        { provide: AUTHZ_ENFORCER, useValue: mockEnforcer },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkPermission', () => {
    it('should call enforcer.enforce', async () => {
      mockEnforcer.enforce.mockResolvedValue(true);
      const result = await service.checkPermission(1, 'read', 'profile');
      expect(mockEnforcer.enforce).toHaveBeenCalledWith('1', 'profile', 'read');
      expect(result).toBe(true);
    });
  });

  describe('createRole', () => {
    it('should create and save a role', async () => {
      const roleData = { name: 'testRole', displayName: 'Test Role' };
      mockRepository.create.mockReturnValue(roleData);
      mockRepository.save.mockResolvedValue(roleData);

      const result = await service.createRole('testRole', 'Test Role');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(roleData);
    });
  });

  describe('getAllPermissionsForUser', () => {
    it('should return formatted permissions', async () => {
      const permissions = [
        ['p', 'resource1', 'action1'],
        ['p', 'resource2', 'action2'],
      ];
      // The mockEnforcer is injected as AUTHZ_ENFORCER.
      // Need to ensure getImplicitPermissionsForUser is mocked.
      // It's not in the initial mock definition above, so I need to add it or cast.
      mockEnforcer['getImplicitPermissionsForUser'] = vi
        .fn()
        .mockResolvedValue(permissions);

      const result = await service.getAllPermissionsForUser(1);
      expect(
        mockEnforcer['getImplicitPermissionsForUser'],
      ).toHaveBeenCalledWith('1');
      expect(result).toEqual(['resource1:action1', 'resource2:action2']);
    });

    it('should handle duplicates', async () => {
      const permissions = [
        ['p', 'resource1', 'action1'],
        ['p', 'resource1', 'action1'],
      ];
      mockEnforcer['getImplicitPermissionsForUser'] = vi
        .fn()
        .mockResolvedValue(permissions);

      const result = await service.getAllPermissionsForUser(1);
      expect(result).toEqual(['resource1:action1']);
    });
  });
});
