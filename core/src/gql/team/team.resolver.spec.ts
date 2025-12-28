import { Test, TestingModule } from '@nestjs/testing';
import { TeamResolver } from './team.resolver';
import { TeamRepository } from '../../db/team/team.repository';
import { TeamObject } from './team.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TeamResolver', () => {
    let resolver: TeamResolver;
    let repo: TeamRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamResolver,
                {
                    provide: TeamRepository,
                    useValue: {
                        findOne: vi.fn(),
                        findOneOrFail: vi.fn(),
                        findOneByOrFail: vi.fn(),
                        find: vi.fn(),
                    },
                },
            ],
        }).compile();

        resolver = module.get<TeamResolver>(TeamResolver);
        repo = module.get<TeamRepository>(TeamRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('teams', () => {
        it('should return an array of teams', async () => {
            const result = [new TeamObject()];
            vi.spyOn(repo, 'find').mockResolvedValue(result as any);

            expect(await resolver.teams()).toBe(result);
        });
    });

    describe('team', () => {
        it('should return a single team', async () => {
            const result = new TeamObject();
            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(result as any);

            expect(await resolver.team('1')).toBe(result);
        });
    });

    describe('club', () => {
        it('should resolve club for a team', async () => {
            const team = new TeamObject();
            team.id = '1';
            const club = { id: '1', name: 'Club 1' };
            
            const findOneByOrFailSpy = vi.spyOn(repo, 'findOneByOrFail').mockResolvedValue({
                ...team,
                club: Promise.resolve(club),
            } as any);

            const result = await resolver.club(team);
            expect(result).toBe(club);
        });
    });

    describe('skillGroup', () => {
        it('should resolve skillGroup for a team', async () => {
            const team = new TeamObject();
            team.id = '1';
            const skillGroup = { id: '1', name: 'SG 1' };

            const findOneOrFailSpy = vi.spyOn(repo, 'findOneOrFail').mockResolvedValue({
                ...team,
                skillGroup: skillGroup as any,
            } as any);

            const result = await resolver.skillGroup(team);
            expect(result).toEqual(skillGroup);
        });
    });
});

