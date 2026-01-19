import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseRoleResolver } from './franchise-role.resolver';
import { FranchiseRoleRepository } from '../../db/franchise_role/franchise_role.repository';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { UserRepository } from '../../db/user/user.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';
import { FranchiseRoleType } from '../../db/franchise_role/franchise_role.entity';

describe('FranchiseRoleResolver', () => {
    let resolver: FranchiseRoleResolver;
    let franchiseRoleRepo: FranchiseRoleRepository;
    let franchiseRepo: FranchiseRepository;
    let userRepo: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FranchiseRoleResolver,
                {
                    provide: FranchiseRoleRepository,
                    useValue: {
                        create: vi.fn(),
                        save: vi.fn(),
                        findOneOrFail: vi.fn(),
                        remove: vi.fn(),
                    },
                },
                {
                    provide: FranchiseRepository,
                    useValue: {
                        findOneOrFail: vi.fn(),
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        findOneOrFail: vi.fn(),
                    },
                },
                {
                    provide: AuthenticateService,
                    useValue: {},
                },
                {
                    provide: AuthorizeService,
                    useValue: {},
                },
            ],
        }).compile();

        resolver = module.get<FranchiseRoleResolver>(FranchiseRoleResolver);
        franchiseRoleRepo = module.get<FranchiseRoleRepository>(FranchiseRoleRepository);
        franchiseRepo = module.get<FranchiseRepository>(FranchiseRepository);
        userRepo = module.get<UserRepository>(UserRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('assignFranchiseRole', () => {
        it('should assign a role to a user in a franchise', async () => {
            const input = {
                userId: 'user-1',
                franchiseId: 'franchise-1',
                roleType: FranchiseRoleType.MANAGER,
            };
            const franchise = { id: 'franchise-1' };
            const user = { id: 'user-1' };
            const franchiseRole = { id: 'role-1', ...input, franchise, user };

            vi.spyOn(franchiseRepo, 'findOneOrFail').mockResolvedValue(franchise as any);
            vi.spyOn(userRepo, 'findOneOrFail').mockResolvedValue(user as any);
            vi.spyOn(franchiseRoleRepo, 'create').mockReturnValue(franchiseRole as any);
            vi.spyOn(franchiseRoleRepo, 'save').mockResolvedValue(franchiseRole as any);

            const result = await resolver.assignFranchiseRole(input);

            expect(result).toBe(franchiseRole);
            expect(franchiseRepo.findOneOrFail).toHaveBeenCalledWith({ where: { id: input.franchiseId } });
            expect(userRepo.findOneOrFail).toHaveBeenCalledWith({ where: { id: input.userId } });
            expect(franchiseRoleRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                roleType: input.roleType,
                franchise,
                user,
            }));
            expect(franchiseRoleRepo.save).toHaveBeenCalledWith(franchiseRole);
        });
    });

    describe('removeFranchiseRole', () => {
        it('should remove a franchise role', async () => {
            const id = 'role-1';
            const franchiseRole = { id, user: { id: 'user-1' }, franchise: { id: 'franchise-1' } };

            vi.spyOn(franchiseRoleRepo, 'findOneOrFail').mockResolvedValue(franchiseRole as any);
            vi.spyOn(franchiseRoleRepo, 'remove').mockResolvedValue(franchiseRole as any);

            const result = await resolver.removeFranchiseRole(id);

            expect(result).toBe(franchiseRole);
            expect(franchiseRoleRepo.findOneOrFail).toHaveBeenCalledWith({
                where: { id },
                relations: ['user', 'franchise'],
            });
            expect(franchiseRoleRepo.remove).toHaveBeenCalledWith(franchiseRole);
        });
    });
});
