import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RbacGuard } from './rbac.guard';
import { RbacService } from '../rbac/rbac.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthPossession, Permission } from 'nest-authz';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';

describe('RbacGuard', () => {
    let guard: RbacGuard;
    let reflector: Reflector;
    let rbacService: RbacService;

    const mockRbacService = {
        checkPermission: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RbacGuard,
                { provide: RbacService, useValue: mockRbacService },
                Reflector,
            ],
        }).compile();

        guard = module.get<RbacGuard>(RbacGuard);
        reflector = module.get<Reflector>(Reflector);
        rbacService = module.get<RbacService>(RbacService);
    });

    const createMockContext = (request: any, handlerPermissions?: Permission[]) => {
        return {
            getHandler: vi.fn(),
            getClass: vi.fn(),
            getType: vi.fn().mockReturnValue('http'),
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        } as unknown as ExecutionContext;
    };

    describe('canActivate', () => {
        it('should allow if no permissions required', async () => {
            const context = createMockContext({});
            vi.spyOn(reflector, 'get').mockReturnValue(undefined); // No permissions
            
            const result = await guard.canActivate(context);
            expect(result).toBe(true);
        });

        it('should validate API Token scopes if token is present', async () => {
            const apiToken = {
                scopes: ['game:read:all'],
            };
            const request = { 
                apiToken,
                user: { id: 1, apiToken: true } 
            };
            const requiredPerms: Permission = {
                resource: Resource.Game,
                action: ResourceAction.Read,
                possession: AuthPossession.ANY,
            };
            
            const context = createMockContext(request);
            vi.spyOn(reflector, 'get').mockReturnValue([requiredPerms]);
            // Mock RbacService to return true (user permission check)
            // But Guard should check SCAN TOKEN SCOPES first.
            mockRbacService.checkPermission.mockResolvedValue(true);

            const result = await guard.canActivate(context);
            expect(result).toBe(true);
        });

        it('should DENY if API Token lacks required scope', async () => {
            const apiToken = {
                scopes: ['user:read:any'], // Mismatch
            };
            const request = { apiToken };
            const requiredPerms: Permission = {
                resource: Resource.Game,
                action: ResourceAction.Read,
                possession: AuthPossession.ANY,
            };

            const context = createMockContext(request);
            vi.spyOn(reflector, 'get').mockReturnValue([requiredPerms]);
            
            // Even if user has permission, token restricts it?
            // Wait, previous implementation logic:
            // if (request.apiToken) { check scopes }
            // If scopes invalid -> throw Forbidden? Or return false?
            // checkPermission is still called?
            // Let's verify the logic I wrote in Step 1.
            
            // Logic from Step 1:
            // "Updated `RbacGuard` to check API token scopes BEFORE checking user permissions"
            // If token invalid, it should return false/throw.
            
            const result = await guard.canActivate(context);
            expect(result).toBe(false);
        });
        
         it('should allow wildcard scope *', async () => {
            const apiToken = {
                scopes: ['*'],
            };
            const request = { 
                apiToken,
                user: { id: 1, apiToken: true } 
            };
            const requiredPerms: Permission = {
                resource: Resource.Game,
                action: ResourceAction.Read,
                possession: AuthPossession.ANY,
            };

            const context = createMockContext(request);
            vi.spyOn(reflector, 'get').mockReturnValue([requiredPerms]);
            mockRbacService.checkPermission.mockResolvedValue(true);

            const result = await guard.canActivate(context);
            expect(result).toBe(true);
        });
    });
});
