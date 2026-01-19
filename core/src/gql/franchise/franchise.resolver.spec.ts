import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseResolver } from './franchise.resolver';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { AuditService } from '../../audit/audit.service';
import { FranchiseObject } from './franchise.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';

describe('FranchiseResolver', () => {
    let resolver: FranchiseResolver;
    let repo: FranchiseRepository;
    let auditService: AuditService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FranchiseResolver,
                {
                    provide: FranchiseRepository,
                    useValue: {
                        findOne: vi.fn(),
                        findOneOrFail: vi.fn(),
                        find: vi.fn(),
                        findAndCountPaginated: vi.fn(),
                        create: vi.fn(),
                        save: vi.fn(),
                        softRemove: vi.fn(),
                    },
                },
                {
                    provide: AuditService,
                    useValue: {
                        log: vi.fn(),
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

        resolver = module.get<FranchiseResolver>(FranchiseResolver);
        repo = module.get<FranchiseRepository>(FranchiseRepository);
        auditService = module.get<AuditService>(AuditService);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('franchises', () => {
        it('should return a paginated response of franchises', async () => {
            const items = [new FranchiseObject()];
            const total = 1;
            const pagination = { offset: 0, limit: 25 };
            const findAndCountSpy = vi.spyOn(repo, 'findAndCountPaginated').mockResolvedValue([items as any, total]);

            const result = await resolver.franchises(pagination);
            expect(result).toEqual({
                items,
                total,
                offset: pagination.offset,
                limit: pagination.limit,
            });
            expect(findAndCountSpy).toHaveBeenCalledWith(pagination, undefined, undefined);
        });

        it('should pass filters and sort to the repository', async () => {
            const items = [new FranchiseObject()];
            const total = 1;
            const pagination = { offset: 10, limit: 5 };
            const filter = { isActive: true };
            const sort = { name: 'ASC' };
            const findAndCountSpy = vi.spyOn(repo, 'findAndCountPaginated').mockResolvedValue([items as any, total]);

            const result = await resolver.franchises(pagination, filter as any, sort as any);
            expect(result).toEqual({
                items,
                total,
                offset: pagination.offset,
                limit: pagination.limit,
            });
            expect(findAndCountSpy).toHaveBeenCalledWith(pagination, filter, sort);
        });
    });

    describe('franchise', () => {
        it('should return a single franchise', async () => {
            const result = new FranchiseObject();
            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(result as any);

            expect(await resolver.franchise('1')).toBe(result);
        });
    });

    describe('createFranchise', () => {
        it('should create a franchise and log it', async () => {
            const input = { name: 'New Franchise', slug: 'new-franchise' };
            const franchise = { id: '1', ...input };
            vi.spyOn(repo, 'create').mockReturnValue(franchise as any);
            vi.spyOn(repo, 'save').mockResolvedValue(franchise as any);

            expect(await resolver.createFranchise(input)).toBe(franchise);
            expect(repo.create).toHaveBeenCalledWith(input);
            expect(repo.save).toHaveBeenCalledWith(franchise);
            expect(auditService.log).toHaveBeenCalledWith('Franchise', '1', 'create', expect.any(Object));
        });
    });

    describe('updateFranchise', () => {
        it('should update a franchise and log it', async () => {
            const id = '1';
            const input = { name: 'Updated Franchise' };
            const existingFranchise = { id, name: 'Old Franchise', slug: 'old' };
            const updatedFranchise = { ...existingFranchise, ...input };

            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(existingFranchise as any);
            vi.spyOn(repo, 'save').mockResolvedValue(updatedFranchise as any);

            expect(await resolver.updateFranchise(id, input)).toBe(updatedFranchise);
            expect(repo.findOneOrFail).toHaveBeenCalledWith({ where: { id } });
            expect(repo.save).toHaveBeenCalledWith(updatedFranchise);
            expect(auditService.log).toHaveBeenCalledWith('Franchise', '1', 'update', expect.any(Object));
        });
    });

    describe('deleteFranchise', () => {
        it('should soft delete a franchise and log it', async () => {
            const id = '1';
            const existingFranchise = { id, name: 'Franchise', clubs: [] };

            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(existingFranchise as any);
            vi.spyOn(repo, 'softRemove').mockResolvedValue(existingFranchise as any);

            expect(await resolver.deleteFranchise(id)).toBe(existingFranchise);
            expect(repo.findOneOrFail).toHaveBeenCalledWith({ where: { id }, relations: ['clubs'] });
            expect(repo.softRemove).toHaveBeenCalledWith(existingFranchise);
            expect(auditService.log).toHaveBeenCalledWith('Franchise', '1', 'delete', expect.any(Object));
        });

        it('should throw error if franchise has active clubs', async () => {
            const id = '1';
            const existingFranchise = { id, name: 'Franchise', clubs: [{ id: 'c1' }] };

            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(existingFranchise as any);

            await expect(resolver.deleteFranchise(id)).rejects.toThrow('Cannot delete a franchise with active clubs');
        });
    });

    describe('clubs', () => {
        it('should resolve clubs for a franchise', async () => {
            const franchise = new FranchiseObject();
            franchise.id = '1';
            const clubs = [{ id: '1', name: 'Club 1' }];

            const findOneSpy = vi.spyOn(repo, 'findOne').mockResolvedValue({
                ...franchise,
                clubs: clubs as any,
            } as any);

            const result = await resolver.clubs(franchise);
            expect(result).toEqual(clubs);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { id: franchise.id },
                relations: ['clubs'],
            });
        });

        it('should return existing clubs if populated', async () => {
            const franchise = new FranchiseObject();
            franchise.clubs = [{ id: '1', name: 'Club 1' }] as any;

            const result = await resolver.clubs(franchise);
            expect(result).toEqual(franchise.clubs);
            expect(repo.findOne).not.toHaveBeenCalled();
        });
    });

    describe('roles', () => {
        it('should resolve roles for a franchise', async () => {
            const franchise = new FranchiseObject();
            franchise.id = '1';
            const roles = [{ id: '1', roleType: 'MANAGER' }];

            const findOneSpy = vi.spyOn(repo, 'findOne').mockResolvedValue({
                ...franchise,
                roles: roles as any,
            } as any);

            const result = await resolver.roles(franchise);
            expect(result).toEqual(roles);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { id: franchise.id },
                relations: ['roles', 'roles.user'],
            });
        });
    });
});

