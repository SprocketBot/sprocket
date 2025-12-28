import { Test, TestingModule } from '@nestjs/testing';
import { ClubResolver } from './club.resolver';
import { ClubRepository } from '../../db/club/club.repository';
import { ClubObject } from './club.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ClubResolver', () => {
    let resolver: ClubResolver;
    let repo: ClubRepository;

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
                        find: vi.fn(),
                    },
                },
            ],
        }).compile();

        resolver = module.get<ClubResolver>(ClubResolver);
        repo = module.get<ClubRepository>(ClubRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('clubs', () => {
        it('should return an array of clubs', async () => {
            const result = [new ClubObject()];
            vi.spyOn(repo, 'find').mockResolvedValue(result as any);

            expect(await resolver.clubs()).toBe(result);
        });
    });

    describe('club', () => {
        it('should return a single club', async () => {
            const result = new ClubObject();
            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(result as any);

            expect(await resolver.club('1')).toBe(result);
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

