import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseResolver } from './franchise.resolver';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { FranchiseObject } from './franchise.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FranchiseResolver', () => {
    let resolver: FranchiseResolver;
    let repo: FranchiseRepository;

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
                    },
                },
            ],
        }).compile();

        resolver = module.get<FranchiseResolver>(FranchiseResolver);
        repo = module.get<FranchiseRepository>(FranchiseRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('franchises', () => {
        it('should return an array of franchises', async () => {
            const result = [new FranchiseObject()];
            vi.spyOn(repo, 'find').mockResolvedValue(result as any);

            expect(await resolver.franchises()).toBe(result);
        });
    });

    describe('franchise', () => {
        it('should return a single franchise', async () => {
            const result = new FranchiseObject();
            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(result as any);

            expect(await resolver.franchise('1')).toBe(result);
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

