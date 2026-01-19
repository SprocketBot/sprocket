import { Test, TestingModule } from '@nestjs/testing';
import { TeamResolver } from './team.resolver';
import { TeamRepository } from '../../db/team/team.repository';
import { TeamObject } from './team.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClubRepository } from '../../db/club/club.repository';
import { SkillGroupRepository } from '../../db/skill_group/skill_group.repository';
import { NotFoundException } from '@nestjs/common';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';

describe('TeamResolver', () => {
    let resolver: TeamResolver;
    let repo: TeamRepository;
    let clubRepo: ClubRepository;
    let skillGroupRepo: SkillGroupRepository;

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
                        findOneBy: vi.fn(),
                        find: vi.fn(),
                        findAndCountPaginated: vi.fn(),
                        create: vi.fn(),
                        save: vi.fn(),
                    },
                },
                {
                    provide: ClubRepository,
                    useValue: {
                        findOneBy: vi.fn(),
                    },
                },
                {
                    provide: SkillGroupRepository,
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

        resolver = module.get<TeamResolver>(TeamResolver);
        repo = module.get<TeamRepository>(TeamRepository);
        clubRepo = module.get<ClubRepository>(ClubRepository);
        skillGroupRepo = module.get<SkillGroupRepository>(SkillGroupRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('teams', () => {
        it('should return a paginated response of teams', async () => {
            const items = [new TeamObject()];
            const total = 1;
            const pagination = { offset: 0, limit: 25 };
            const findAndCountSpy = vi.spyOn(repo, 'findAndCountPaginated').mockResolvedValue([items as any, total]);

            const result = await resolver.teams(pagination);
            expect(result).toEqual({
                items,
                total,
                offset: pagination.offset,
                limit: pagination.limit,
            });
            expect(findAndCountSpy).toHaveBeenCalledWith(pagination, undefined, undefined);
        });
    });

    describe('team', () => {
        it('should return a single team', async () => {
            const result = new TeamObject();
            vi.spyOn(repo, 'findOneOrFail').mockResolvedValue(result as any);

            expect(await resolver.team('1')).toBe(result);
        });
    });

    describe('createTeam', () => {
        it('should create a team', async () => {
            const data = { name: 'Team 1', slug: 'team-1', rosterSizeLimit: 5, clubId: '1', skillGroupId: '1' };
            const club = { id: '1' };
            const skillGroup = { id: '1' };
            const team = { ...data, club, skillGroup };

            vi.spyOn(clubRepo, 'findOneBy').mockResolvedValue(club as any);
            vi.spyOn(skillGroupRepo, 'findOneBy').mockResolvedValue(skillGroup as any);
            vi.spyOn(repo, 'create').mockReturnValue(team as any);
            vi.spyOn(repo, 'save').mockResolvedValue(team as any);

            expect(await resolver.createTeam(data)).toBe(team);
        });

        it('should throw NotFoundException if club not found', async () => {
            const data = { name: 'Team 1', slug: 'team-1', rosterSizeLimit: 5, clubId: '1', skillGroupId: '1' };
            vi.spyOn(clubRepo, 'findOneBy').mockResolvedValue(null);

            await expect(resolver.createTeam(data)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if skillGroup not found', async () => {
            const data = { name: 'Team 1', slug: 'team-1', rosterSizeLimit: 5, clubId: '1', skillGroupId: '1' };
            vi.spyOn(clubRepo, 'findOneBy').mockResolvedValue({ id: '1' } as any);
            vi.spyOn(skillGroupRepo, 'findOneBy').mockResolvedValue(null);

            await expect(resolver.createTeam(data)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTeam', () => {
        it('should update a team', async () => {
            const id = '1';
            const data = { name: 'Updated Team' };
            const team = { id, name: 'Team 1' };

            vi.spyOn(repo, 'findOneBy').mockResolvedValue(team as any);
            vi.spyOn(repo, 'save').mockResolvedValue({ ...team, ...data } as any);

            const result = await resolver.updateTeam(id, data);
            expect(result.name).toBe('Updated Team');
        });

        it('should throw NotFoundException if team not found', async () => {
            vi.spyOn(repo, 'findOneBy').mockResolvedValue(null);
            await expect(resolver.updateTeam('1', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteTeam', () => {
        it('should deactivate a team', async () => {
            const id = '1';
            const team = { id, isActive: true };

            vi.spyOn(repo, 'findOneBy').mockResolvedValue(team as any);
            vi.spyOn(repo, 'save').mockImplementation(async (t) => t as any);

            const result = await resolver.deleteTeam(id);
            expect(result.isActive).toBe(false);
        });

        it('should throw NotFoundException if team not found', async () => {
            vi.spyOn(repo, 'findOneBy').mockResolvedValue(null);
            await expect(resolver.deleteTeam('1')).rejects.toThrow(NotFoundException);
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

