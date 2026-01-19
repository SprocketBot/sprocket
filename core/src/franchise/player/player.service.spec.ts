import {JwtService} from "@nestjs/jwt";
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {EventsService, NotificationService} from "@sprocketbot/common";
import type {QueryRunner, Repository} from "typeorm";
import {DataSource} from "typeorm";

import {Player} from "../../database/franchise/player/player.model";
import {User} from "../../database/identity/user/user.model";
import {UserAuthenticationAccount} from "../../database/identity/user_authentication_account/user_authentication_account.model";
import {UserAuthenticationAccountType} from "../../database/identity/user_authentication_account/user_authentication_account_type.enum";
import {UserProfile} from "../../database/identity/user_profile/user_profile.model";
import {MLE_Player} from "../../database/mledb/Player.model";
import {MLE_PlayerAccount} from "../../database/mledb/PlayerAccount.model";
import {PlayerToPlayer} from "../../database/mledb-bridge/player_to_player.model";
import {PlayerToUser} from "../../database/mledb-bridge/player_to_user.model";
import {Member} from "../../database/organization/member/member.model";
import {MemberProfile} from "../../database/organization/member_profile/member_profile.model";
import {Organization} from "../../database/organization/organization/organization.model";
import {EloConnectorService} from "../../elo/elo-connector";
import {PlatformService} from "../../game";
import {OrganizationService} from "../../organization";
import {MemberService} from "../../organization/member/member.service";
import {GameSkillGroupService} from "../game-skill-group";
import {PlayerService} from "./player.service";
import {OperationError} from "./player.types";

describe("PlayerService", () => {
    let service: PlayerService;
    let playerRepository: Repository<Player>;
    let userRepository: Repository<User>;
    let userProfileRepository: Repository<UserProfile>;
    let memberRepository: Repository<Member>;
    let memberProfileRepository: Repository<MemberProfile>;
    let organizationRepository: Repository<Organization>;
    let userAuthRepository: Repository<UserAuthenticationAccount>;
    let ptuRepo: Repository<PlayerToUser>;
    let ptpRepo: Repository<PlayerToPlayer>;
    let mlePlayerRepository: Repository<MLE_Player>;
    let mlePlayerAccountRepository: Repository<MLE_PlayerAccount>;
    let memberService: MemberService;
    let organizationService: OrganizationService;
    let skillGroupService: GameSkillGroupService;
    let eventsService: EventsService;
    let notificationService: NotificationService;
    let jwtService: JwtService;
    let dataSource: DataSource;
    let platformService: PlatformService;
    let eloConnectorService: EloConnectorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayerService,
                {
                    provide: getRepositoryToken(Player),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        find: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        merge: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOneOrFail: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(UserProfile),
                    useValue: {
                        findOneOrFail: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Member),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(MemberProfile),
                    useValue: {
                        findOneOrFail: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Organization),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(UserAuthenticationAccount),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(PlayerToUser),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(PlayerToPlayer),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(MLE_Player),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(MLE_PlayerAccount),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(MLE_PlayerAccount),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: MemberService,
                    useValue: {
                        getMemberById: jest.fn(),
                    },
                },
                {
                    provide: OrganizationService,
                    useValue: {
                        getOrganizationProfileForOrganization: jest.fn(),
                    },
                },
                {
                    provide: GameSkillGroupService,
                    useValue: {
                        getGameSkillGroup: jest.fn(),
                        getGameSkillGroupById: jest.fn(),
                    },
                },
                {
                    provide: EventsService,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        send: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
                {
                    provide: DataSource,
                    useValue: {
                        createQueryRunner: jest.fn(),
                    },
                },
                {
                    provide: PlatformService,
                    useValue: {
                        getPlatformByCode: jest.fn(),
                    },
                },
                {
                    provide: EloConnectorService,
                    useValue: {
                        createJob: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PlayerService>(PlayerService);
        playerRepository = module.get<Repository<Player>>(getRepositoryToken(Player));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        userProfileRepository = module.get<Repository<UserProfile>>(getRepositoryToken(UserProfile));
        memberRepository = module.get<Repository<Member>>(getRepositoryToken(Member));
        memberProfileRepository = module.get<Repository<MemberProfile>>(getRepositoryToken(MemberProfile));
        organizationRepository = module.get<Repository<Organization>>(getRepositoryToken(Organization));
        userAuthRepository = module.get<Repository<UserAuthenticationAccount>>(getRepositoryToken(UserAuthenticationAccount));
        ptuRepo = module.get<Repository<PlayerToUser>>(getRepositoryToken(PlayerToUser));
        ptpRepo = module.get<Repository<PlayerToPlayer>>(getRepositoryToken(PlayerToPlayer));
        mlePlayerRepository = module.get<Repository<MLE_Player>>(getRepositoryToken(MLE_Player));
        mlePlayerAccountRepository = module.get<Repository<MLE_PlayerAccount>>(getRepositoryToken(MLE_PlayerAccount));
        memberService = module.get<MemberService>(MemberService);
        organizationService = module.get<OrganizationService>(OrganizationService);
        skillGroupService = module.get<GameSkillGroupService>(GameSkillGroupService);
        eventsService = module.get<EventsService>(EventsService);
        notificationService = module.get<NotificationService>(NotificationService);
        jwtService = module.get<JwtService>(JwtService);
        dataSource = module.get<DataSource>(DataSource);
        platformService = module.get<PlatformService>(PlatformService);
        eloConnectorService = module.get<EloConnectorService>(EloConnectorService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getPlayer", () => {
        it("should call playerRepository.findOneOrFail with correct parameters", async () => {
            const query = {
                where: {id: 1},
                relations: {
                    member: {
                        user: {
                            authenticationAccounts: true,
                        },
                        organization: true,
                        profile: true,
                    },
                    skillGroup: {
                        organization: true,
                        game: true,
                        profile: true,
                    },
                },
            };

            const expectedPlayer = {
                id: 1,
                member: {
                    id: 1,
                    user: {
                        id: 1,
                        authenticationAccounts: [],
                    },
                    organization: {id: 1},
                    profile: {name: "Test Player"},
                },
                skillGroup: {id: 1},
                skillGroupId: 1,
                salary: 50000,
                franchiseName: "Test Franchise",
                franchisePositions: [],
            } as unknown as Player;

            (playerRepository.findOneOrFail as jest.Mock).mockResolvedValue(expectedPlayer);

            const result = await service.getPlayer(query);

            expect(playerRepository.findOneOrFail).toHaveBeenCalledWith(query);
            expect(result).toEqual(expectedPlayer);
        });

        it("should throw error when player not found", async () => {
            const query = {where: {id: 999} };

            (playerRepository.findOneOrFail as jest.Mock).mockRejectedValue(new Error("Player not found"));

            await expect(service.getPlayer(query)).rejects.toThrow("Player not found");
        });
    });

    describe("getPlayerById", () => {
        it("should call playerRepository.findOneOrFail with id", async () => {
            const id = 1;
            const expectedPlayer = {id} as Player;

            (playerRepository.findOneOrFail as jest.Mock).mockResolvedValue(expectedPlayer);

            const result = await service.getPlayerById(id);

            expect(playerRepository.findOneOrFail).toHaveBeenCalledWith({where: {id} });
            expect(result).toEqual(expectedPlayer);
        });
    });

    describe("getPlayerByOrganizationAndGame", () => {
        it("should find player with correct relations", async () => {
            const userId = 1;
            const organizationId = 1;
            const gameId = 7;

            const expectedPlayer = {
                id: 1,
                member: {id: 1},
                skillGroup: {id: 1},
            } as Player;

            (playerRepository.findOneOrFail as jest.Mock).mockResolvedValue(expectedPlayer);

            const result = await service.getPlayerByOrganizationAndGame(userId, organizationId, gameId);

            expect(playerRepository.findOneOrFail).toHaveBeenCalledWith({
                where: {
                    member: {
                        user: {id: userId},
                        organization: {id: organizationId},
                    },
                    skillGroup: {
                        game: {id: gameId},
                    },
                },
                relations: ["member", "skillGroup"],
            });
            expect(result).toEqual(expectedPlayer);
        });
    });

    describe("createPlayer", () => {
        it("should create player with member and skill group", async () => {
            const memberId = 1;
            const skillGroupId = 1;
            const salary = 50000;

            const mockMember = {id: memberId} as Member;
            const mockSkillGroup = {id: skillGroupId} as any;

            const expectedPlayer = {
                id: 1,
                member: mockMember,
                skillGroup: mockSkillGroup,
                salary,
            } as Player;

            (memberService.getMemberById as jest.Mock).mockResolvedValue(mockMember);
            (skillGroupService.getGameSkillGroupById as jest.Mock).mockResolvedValue(mockSkillGroup);

            (playerRepository.create as jest.Mock).mockReturnValue(expectedPlayer);
            (playerRepository.save as jest.Mock).mockResolvedValue(expectedPlayer);

            const result = await service.createPlayer(memberId, skillGroupId, salary);

            expect(memberService.getMemberById).toHaveBeenCalledWith(memberId);
            expect(skillGroupService.getGameSkillGroupById).toHaveBeenCalledWith(skillGroupId);
            expect(playerRepository.create).toHaveBeenCalledWith({
                member: mockMember,
                skillGroup: mockSkillGroup,
                salary,
            });
            expect(playerRepository.save).toHaveBeenCalledWith(expectedPlayer);
            expect(result).toEqual(expectedPlayer);
        });

        it("should handle member object input", async () => {
            const member = {id: 1} as Member;
            const skillGroupId = 1;
            const salary = 50000;
            const mockSkillGroup = {id: skillGroupId} as any;

            const expectedPlayer = {
                id: 1,
                member,
                skillGroup: mockSkillGroup,
                salary,
            } as Player;

            (skillGroupService.getGameSkillGroupById as jest.Mock).mockResolvedValue(mockSkillGroup);

            (playerRepository.create as jest.Mock).mockReturnValue(expectedPlayer);
            (playerRepository.save as jest.Mock).mockResolvedValue(expectedPlayer);

            const result = await service.createPlayer(member, skillGroupId, salary);

            expect(memberService.getMemberById).not.toHaveBeenCalled();
            expect(playerRepository.create).toHaveBeenCalledWith({
                member,
                skillGroup: mockSkillGroup,
                salary,
            });
            expect(result).toEqual(expectedPlayer);
        });

        it("should handle errors during player creation", async () => {
            const memberId = 1;
            const skillGroupId = 1;
            const salary = 50000;

            const mockMember = {id: memberId} as Member;
            const mockSkillGroup = {id: skillGroupId} as any;

            (memberService.getMemberById as jest.Mock).mockRejectedValue(new Error("Database error"));

            await expect(service.createPlayer(memberId, skillGroupId, salary)).rejects.toThrow("Database error");
        });
    });

    describe("intakeUser", () => {
        it("should handle new user creation successfully", async () => {
            const name = "Test Player";
            const d_id = "123456789";
            const ptl = [
                {
                    gameSkillGroupId: 1,
                    salary: 50000,
                },
            ];

            const mockUser = null;
            const mockMember = {id: 1} as Member;
            const mockPlayer = {id: 1} as Player;

            const mockQueryRunner = {
                manager: {
                    findOne: jest.fn().mockResolvedValue(mockUser),
                    save: jest.fn(),
                },
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                rollbackTransaction: jest.fn(),
                release: jest.fn(),
            } as unknown as QueryRunner;

            (dataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);
            (service.createPlayer as jest.Mock) = jest.fn().mockResolvedValue(mockPlayer);

            const result = await service.intakeUser(name, d_id, ptl);

            expect(dataSource.createQueryRunner).toHaveBeenCalled();
            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();

            // Verify transaction was committed
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it("should handle existing user with no MLE member", async () => {
            const name = "Test Player";
            const d_id = "123456789";
            const ptl = [
                {
                    gameSkillGroupId: 1,
                    salary: 50000,
                },
            ];

            const mockUser = {
                id: 1,
                members: [],
                authenticationAccounts: [],
                profile: {displayName: "Test User"},
            } as unknown as User;

            const mockMember = {id: 1} as Member;

            const mockQueryRunner = {
                manager: {
                    findOne: jest.fn().mockResolvedValue(mockUser),
                    save: jest.fn(),
                },
            } as unknown as QueryRunner;

            const mockPlayer = {id: 1} as Player;

            (dataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);
            (service.createPlayer as jest.Mock) = jest.fn().mockResolvedValue(mockPlayer);

            (dataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);
            (memberRepository.create as jest.Mock).mockReturnValue(mockMember);
            (memberProfileRepository.create as jest.Mock).mockReturnValue({name} as MemberProfile);

            const result = await service.intakeUser(name, d_id, ptl);

            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
        });

        it("should handle errors and rollback transaction", async () => {
            const name = "Test Player";
            const d_id = "123456789";
            const ptl = [
                {
                    gameSkillGroupId: 1,
                    salary: 50000,
                },
            ];

            const mockQueryRunner = {
                manager: {
                    findOne: jest.fn().mockResolvedValue(null),
                    save: jest.fn(),
                },
            } as unknown as QueryRunner;

            (dataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);
            (service.createPlayer as jest.Mock) = jest.fn().mockRejectedValue(new Error("Creation failed"));

            (dataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);

            const result = await service.intakeUser(name, d_id, ptl);

            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });
    });

    describe("updatePlayerStanding", () => {
        it("should update player salary and skill group", async () => {
            const playerId = 1;
            const salary = 60000;
            const skillGroupId = 2;

            const mockPlayer = {id: playerId} as Player;
            const mockSkillGroup = {id: skillGroupId} as any;

            (playerRepository.findOneOrFail as jest.Mock).mockResolvedValue(mockPlayer);
            (skillGroupService.getGameSkillGroupById as jest.Mock).mockResolvedValue(mockSkillGroup);

            (playerRepository.findOneOrFail as jest.Mock).mockResolvedValue(mockPlayer);

            const result = await service.updatePlayerStanding(playerId, salary, skillGroupId);

            expect(playerRepository.merge).toHaveBeenCalledWith(mockPlayer, {salary, skillGroup: mockSkillGroup});
            expect(playerRepository.save).toHaveBeenCalledWith(mockPlayer);
            expect(result).toEqual(mockPlayer);
        });

        it("should update only salary when no skillGroupId provided", async () => {
            const playerId = 1;
            const salary = 60000;

            const mockPlayer = {id: playerId} as Player;

            (playerRepository.findOneOrFail as jest.Mock).mockResolvedValue(mockPlayer);

            const result = await service.updatePlayerStanding(playerId, salary);

            expect(playerRepository.merge).toHaveBeenCalledWith(mockPlayer, {salary});
            expect(playerRepository.save).toHaveBeenCalledWith(mockPlayer);
        });
    });

    describe("mle_movePlayerToLeague", () => {
        it("should move player to new league", async () => {
            const sprocPlayerId = 1;
            const salary = 60000;
            const skillGroupId = 2;

            const mockPlayer = {id: sprocPlayerId} as Player;
            (playerRepository.findOneOrFail as jest.Mock).mockResolvedValue(mockPlayer);

            const result = await service.mle_movePlayerToLeague(sprocPlayerId, salary, skillGroupId);

            expect(playerRepository.findOneOrFail).toHaveBeenCalledWith({
                where: {id: sprocPlayerId},
                relations: {
                    member: {
                        profile: true,
                        user: {
                            authenticationAccounts: true,
                        },
                    },
                    skillGroup: true,
                },
            });
        });
    });

    describe("swapDiscordAccounts", () => {
        it("should update discord account in MLE and Sprocket", async () => {
            const newAcct = "new_discord_id";
            const oldAcct = "old_discord_id";

            const mockMlePlayer = {id: 1, discordId: oldAcct} as MLE_Player;
            const mockUserAuthAccount = {accountId: oldAcct} as UserAuthenticationAccount;

            (mlePlayerRepository.findOneOrFail as jest.Mock).mockResolvedValue(mockMlePlayer);
            (userAuthRepository.findOneOrFail as jest.Mock).mockResolvedValue(mockUserAuthAccount);

            await service.swapDiscordAccounts(newAcct, oldAcct);

            expect(mlePlayerRepository.findOneOrFail).toHaveBeenCalledWith({where: {discordId: oldAcct} });
            expect(mlePlayerRepository.save).toHaveBeenCalledWith(mockMlePlayer);
            expect(userAuthRepository.save).toHaveBeenCalledWith(mockUserAuthAccount);
        });
    });
});
