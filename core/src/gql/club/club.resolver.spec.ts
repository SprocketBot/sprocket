import { Test, TestingModule } from '@nestjs/testing';
import { ClubResolver } from './club.resolver';
import { ClubRepository } from '../../db/club/club.repository';
import { ClubObject } from './club.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FranchiseRepository } from '../../db/franchise/franchise.repository';
import { GameRepository } from '../../db/game/game.repository';
import { NotFoundException } from '@nestjs/common';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';

describe('ClubResolver', () => {
    let resolver: ClubResolver;
    let repo: ClubRepository;
    let franchiseRepo: FranchiseRepository;
    let gameRepo: GameRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClubResolver,
                {
                    provide: ClubRepository,
                    useValue: {
                        findOne: vi.fn(),
                        findOneOrFail: vi.fn(),
                        findOneByOrFail: vi.fn(),
                        findOneBy: vi.fn(),
                        find: vi.fn(),
                        findAndCountPaginated: vi.fn(),
                        create: vi.fn(),
                        save: vi.fn(),
                    },
                },
                {
                    provide: FranchiseRepository,
                    useValue: {
                        findOneBy: vi.fn(),
                    },
                },
                {
                    provide: GameRepository,
                    useValue: {
                        findOneBy: vi.fn(),
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

        resolver = module.get<ClubResolver>(ClubResolver);
        repo = module.get<ClubRepository>(ClubRepository);
        franchiseRepo = module.get<FranchiseRepository>(FranchiseRepository);
        gameRepo = module.get<GameRepository>(GameRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('clubs', () => {
        it('should return a paginated response of clubs', async () => {
            const items = [new ClubObject()];
            const total = 1;
            const pagination = { offset: 0, limit: 25 };
            const findAndCountSpy = vi.spyOn(repo, 'findAndCountPaginated').mockResolvedValue([items as any, total]);

            const result = await resolver.clubs(pagination);
            expect(result).toEqual({
                items,
                total,
                offset: pagination.offset,
                limit: pagination.limit,
            });
            expect(findAndCountSpy).toHaveBeenCalledWith(pagination, undefined, undefined);
        });
    });

    describe('club', () => {
        it('should return a single club', async () => {
            const result = new ClubObject();
            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(result as any);

            expect(await resolver.club('1')).toBe(result);
        });
    });

    describe('createClub', () => {
        it('should create a club', async () => {
            const data = {
                name: 'Test Club',
                slug: 'test-club',
                franchiseId: 'f1',
                gameId: 'g1',
            };
            const franchise = { id: 'f1' };
            const game = { id: 'g1' };
            const club = { id: 'c1', ...data, franchise, game };

            vi.spyOn(franchiseRepo, 'findOneBy').mockResolvedValue(franchise as any);
            vi.spyOn(gameRepo, 'findOneBy').mockResolvedValue(game as any);
            vi.spyOn(repo, 'create').mockReturnValue(club as any);
            vi.spyOn(repo, 'save').mockResolvedValue(club as any);

            const result = await resolver.createClub(data);
            expect(result).toBe(club);
            expect(repo.create).toHaveBeenCalledWith({
                name: data.name,
                slug: data.slug,
                franchise,
                game,
            });
        });

        it('should throw NotFoundException if franchise not found', async () => {
            vi.spyOn(franchiseRepo, 'findOneBy').mockResolvedValue(null);
            await expect(resolver.createClub({ franchiseId: 'invalid' } as any)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if game not found', async () => {
            vi.spyOn(franchiseRepo, 'findOneBy').mockResolvedValue({ id: 'f1' } as any);
            vi.spyOn(gameRepo, 'findOneBy').mockResolvedValue(null);
            await expect(resolver.createClub({ franchiseId: 'f1', gameId: 'invalid' } as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateClub', () => {
        it('should update a club', async () => {
            const club = { id: '1', name: 'Old Name' };
            const data = { name: 'New Name' };
            vi.spyOn(repo, 'findOneBy').mockResolvedValue(club as any);
            vi.spyOn(repo, 'save').mockImplementation(async (c) => c as any);

            const result = await resolver.updateClub('1', data);
            expect(result.name).toBe('New Name');
        });

        it('should throw NotFoundException if club not found', async () => {
            vi.spyOn(repo, 'findOneBy').mockResolvedValue(null);
            await expect(resolver.updateClub('1', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteClub', () => {
        it('should deactivate a club', async () => {
            const club = { id: '1', isActive: true };
            vi.spyOn(repo, 'findOneBy').mockResolvedValue(club as any);
            vi.spyOn(repo, 'save').mockImplementation(async (c) => c as any);

            const result = await resolver.deleteClub('1');
            expect(result.isActive).toBe(false);
        });

        it('should throw NotFoundException if club not found', async () => {
            vi.spyOn(repo, 'findOneBy').mockResolvedValue(null);
            await expect(resolver.deleteClub('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('teams', () => {
        it('should resolve teams for a club', async () => {
            const club = new ClubObject();
            club.id = '1';
            const teams = [{ id: '1', name: 'Team 1' }];

            const findOneSpy = vi.spyOn(repo, 'findOne').mockResolvedValue({
                ...club,
                teams: teams as any,
            } as any);

            const result = await resolver.teams(club);
            expect(result).toEqual(teams);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { id: club.id },
                relations: ['teams'],
            });
        });
    });

    describe('franchise', () => {
        it('should resolve franchise for a club', async () => {
            const club = new ClubObject();
            club.id = '1';
            const franchise = { id: '1', name: 'Franchise 1' };

            const findOneByOrFailSpy = vi.spyOn(repo, 'findOneByOrFail').mockResolvedValue({
                ...club,
                franchise: Promise.resolve(franchise),
            } as any);

            const result = await resolver.franchise(club);
            expect(result).toBe(franchise);
        });
    });
});

