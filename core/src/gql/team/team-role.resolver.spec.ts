import { Test, TestingModule } from '@nestjs/testing';
import { TeamRoleResolver } from './team-role.resolver';
import { TeamRoleRepository } from '../../db/team_role/team_role.repository';
import { TeamRepository } from '../../db/team/team.repository';
import { UserRepository } from '../../db/user/user.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';
import { TeamRoleType } from '../../db/team_role/team_role.entity';

describe('TeamRoleResolver', () => {
    let resolver: TeamRoleResolver;
    let teamRoleRepo: TeamRoleRepository;
    let teamRepo: TeamRepository;
    let userRepo: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamRoleResolver,
                {
                    provide: TeamRoleRepository,
                    useValue: {
                        create: vi.fn(),
                        save: vi.fn(),
                        findOneOrFail: vi.fn(),
                        remove: vi.fn(),
                    },
                },
                {
                    provide: TeamRepository,
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

        resolver = module.get<TeamRoleResolver>(TeamRoleResolver);
        teamRoleRepo = module.get<TeamRoleRepository>(TeamRoleRepository);
        teamRepo = module.get<TeamRepository>(TeamRepository);
        userRepo = module.get<UserRepository>(UserRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('assignTeamRole', () => {
        it('should assign a role to a user in a team', async () => {
            const input = {
                userId: 'user-1',
                teamId: 'team-1',
                roleType: TeamRoleType.CAPTAIN,
            };
            const team = { id: 'team-1' };
            const user = { id: 'user-1' };
            const teamRole = { id: 'role-1', ...input, team, user };

            vi.spyOn(teamRepo, 'findOneOrFail').mockResolvedValue(team as any);
            vi.spyOn(userRepo, 'findOneOrFail').mockResolvedValue(user as any);
            vi.spyOn(teamRoleRepo, 'create').mockReturnValue(teamRole as any);
            vi.spyOn(teamRoleRepo, 'save').mockResolvedValue(teamRole as any);

            const result = await resolver.assignTeamRole(input);

            expect(result).toBe(teamRole);
            expect(teamRepo.findOneOrFail).toHaveBeenCalledWith({ where: { id: input.teamId } });
            expect(userRepo.findOneOrFail).toHaveBeenCalledWith({ where: { id: input.userId } });
            expect(teamRoleRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                roleType: input.roleType,
                team,
                user,
            }));
            expect(teamRoleRepo.save).toHaveBeenCalledWith(teamRole);
        });
    });

    describe('removeTeamRole', () => {
        it('should remove a team role', async () => {
            const id = 'role-1';
            const teamRole = { id, user: { id: 'user-1' }, team: { id: 'team-1' } };

            vi.spyOn(teamRoleRepo, 'findOneOrFail').mockResolvedValue(teamRole as any);
            vi.spyOn(teamRoleRepo, 'remove').mockResolvedValue(teamRole as any);

            const result = await resolver.removeTeamRole(id);

            expect(result).toBe(teamRole);
            expect(teamRoleRepo.findOneOrFail).toHaveBeenCalledWith({
                where: { id },
                relations: ['user', 'team'],
            });
            expect(teamRoleRepo.remove).toHaveBeenCalledWith(teamRole);
        });
    });
});
