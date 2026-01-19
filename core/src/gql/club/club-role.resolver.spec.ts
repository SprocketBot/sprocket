import { Test, TestingModule } from '@nestjs/testing';
import { ClubRoleResolver } from './club-role.resolver';
import { ClubRoleRepository } from '../../db/club_role/club_role.repository';
import { ClubRepository } from '../../db/club/club.repository';
import { UserRepository } from '../../db/user/user.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';
import { ClubRoleType } from '../../db/club_role/club_role.entity';

describe('ClubRoleResolver', () => {
    let resolver: ClubRoleResolver;
    let clubRoleRepo: ClubRoleRepository;
    let clubRepo: ClubRepository;
    let userRepo: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClubRoleResolver,
                {
                    provide: ClubRoleRepository,
                    useValue: {
                        create: vi.fn(),
                        save: vi.fn(),
                        findOneOrFail: vi.fn(),
                        remove: vi.fn(),
                    },
                },
                {
                    provide: ClubRepository,
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

        resolver = module.get<ClubRoleResolver>(ClubRoleResolver);
        clubRoleRepo = module.get<ClubRoleRepository>(ClubRoleRepository);
        clubRepo = module.get<ClubRepository>(ClubRepository);
        userRepo = module.get<UserRepository>(UserRepository);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('assignClubRole', () => {
        it('should assign a role to a user in a club', async () => {
            const input = {
                userId: 'user-1',
                clubId: 'club-1',
                roleType: ClubRoleType.GENERAL_MANAGER,
            };
            const club = { id: 'club-1' };
            const user = { id: 'user-1' };
            const clubRole = { id: 'role-1', ...input, club, user };

            vi.spyOn(clubRepo, 'findOneOrFail').mockResolvedValue(club as any);
            vi.spyOn(userRepo, 'findOneOrFail').mockResolvedValue(user as any);
            vi.spyOn(clubRoleRepo, 'create').mockReturnValue(clubRole as any);
            vi.spyOn(clubRoleRepo, 'save').mockResolvedValue(clubRole as any);

            const result = await resolver.assignClubRole(input);

            expect(result).toBe(clubRole);
            expect(clubRepo.findOneOrFail).toHaveBeenCalledWith({ where: { id: input.clubId } });
            expect(userRepo.findOneOrFail).toHaveBeenCalledWith({ where: { id: input.userId } });
            expect(clubRoleRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                roleType: input.roleType,
                club,
                user,
            }));
            expect(clubRoleRepo.save).toHaveBeenCalledWith(clubRole);
        });
    });

    describe('removeClubRole', () => {
        it('should remove a club role', async () => {
            const id = 'role-1';
            const clubRole = { id, user: { id: 'user-1' }, club: { id: 'club-1' } };

            vi.spyOn(clubRoleRepo, 'findOneOrFail').mockResolvedValue(clubRole as any);
            vi.spyOn(clubRoleRepo, 'remove').mockResolvedValue(clubRole as any);

            const result = await resolver.removeClubRole(id);

            expect(result).toBe(clubRole);
            expect(clubRoleRepo.findOneOrFail).toHaveBeenCalledWith({
                where: { id },
                relations: ['user', 'club'],
            });
            expect(clubRoleRepo.remove).toHaveBeenCalledWith(clubRole);
        });
    });
});
