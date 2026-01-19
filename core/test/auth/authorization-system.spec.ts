import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthorizeGuard } from '../../src/auth/authorize/authorize.guard';
import { AuthorizeService } from '../../src/auth/authorize/authorize.service';
import { AuthenticateService } from '../../src/auth/authenticate/authenticate.service';
import { ExecutionContext } from '@nestjs/common';
import { User } from '@sprocketbot/lib/types';
import { ResourceAction } from '@sprocketbot/lib/types';
import { AUTHZ_ENFORCER } from 'nest-authz';
import { UserRepository } from '../../src/db/user/user.repository';

describe('Authorization System', () => {
    let authorizeService: AuthorizeService;
    let authenticateService: AuthenticateService;
    let enforcer: any;

    const mockUser: User = {
        id: '123',
        username: 'testuser',
        active: true,
    };

    const mockRequest = {
        headers: {},
        cookies: {},
    };

    const mockExecutionContext = {
        getType: () => 'http',
        switchToHttp: () => ({
            getRequest: () => mockRequest,
        }),
    } as unknown as ExecutionContext;

    beforeEach(async () => {
        enforcer = {
            getImplicitPermissionsForUser: vi.fn().mockResolvedValue([['123', 'default', 'read']]),
            enforce: vi.fn().mockResolvedValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthorizeService,
                {
                    provide: AuthenticateService,
                    useValue: {
                        getUserFromRequest: vi.fn().mockResolvedValue(mockUser),
                    },
                },
                {
                    provide: AUTHZ_ENFORCER,
                    useValue: enforcer,
                },
                {
                    provide: UserRepository,
                    useValue: {
                        findBy: vi.fn().mockResolvedValue([mockUser]),
                    },
                },
            ],
        }).compile();

        authenticateService = module.get<AuthenticateService>(AuthenticateService);
        authorizeService = module.get<AuthorizeService>(AuthorizeService);
    });

    describe('AuthorizeGuard', () => {
        it('should allow access when no specific permissions are required', async () => {
            const guard = AuthorizeGuard();
            const canActivate = await guard.prototype.canActivate.call(
                {
                    authenticateService,
                    authService: authorizeService,
                    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
                },
                mockExecutionContext
            );

            expect(canActivate).toBe(true);
            expect(authenticateService.getUserFromRequest).toHaveBeenCalledWith(mockRequest);
        });

        it('should allow access when user has required permissions', async () => {
            const guard = AuthorizeGuard({ action: ResourceAction.Read });
            const canActivate = await guard.prototype.canActivate.call(
                {
                    authenticateService,
                    authService: authorizeService,
                    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
                },
                mockExecutionContext
            );

            expect(canActivate).toBe(true);
            // AuthorizeGuard calls authService.check(user, action, 'default')
            // AuthorizeService.check calls checkPermission(123, action, 'default')
            // checkPermission calls getAllPermissionsForUser(123)
            // which returns ['default:read']
            expect(enforcer.getImplicitPermissionsForUser).toHaveBeenCalledWith('123');
        });

        it('should deny access when user lacks required permissions', async () => {
            enforcer.getImplicitPermissionsForUser.mockResolvedValue([]);

            const guard = AuthorizeGuard({ action: ResourceAction.Update });
            const canActivate = await guard.prototype.canActivate.call(
                {
                    authenticateService,
                    authService: authorizeService,
                    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
                },
                mockExecutionContext
            );

            expect(canActivate).toBe(false);
        });

        it('should deny access when no user is found', async () => {
            vi.spyOn(authenticateService, 'getUserFromRequest').mockResolvedValue(null);

            const guard = AuthorizeGuard();
            const canActivate = await guard.prototype.canActivate.call(
                {
                    authenticateService,
                    authService: authorizeService,
                    logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
                },
                mockExecutionContext
            );

            expect(canActivate).toBe(false);
        });
    });

    describe('AuthorizeService', () => {
        it('should check permissions correctly', async () => {
            const result = await authorizeService.check(mockUser, ResourceAction.Read, 'default');

            expect(result).toBe(true);
            expect(enforcer.getImplicitPermissionsForUser).toHaveBeenCalledWith('123');
        });

        it('should handle user ID conversion correctly', async () => {
            const userWithStringId = { ...mockUser, id: '456' };
            enforcer.getImplicitPermissionsForUser.mockResolvedValue([['456', 'default', 'read']]);

            const result = await authorizeService.check(userWithStringId, ResourceAction.Read, 'default');

            expect(result).toBe(true);
            expect(enforcer.getImplicitPermissionsForUser).toHaveBeenCalledWith('456');
        });

        it('should return false for invalid user ID format', async () => {
            const userWithInvalidId = { ...mockUser, id: 'invalid' };

            const result = await authorizeService.check(userWithInvalidId, ResourceAction.Read, 'default');

            expect(result).toBe(false);
        });
    });
});