import {Injectable, Logger} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import type {CoreEndpoint, CoreOutput, NotificationInput} from "@sprocketbot/common";
import {
    ButtonComponentStyle,
    ComponentType,
    config,
    EventsService,
    EventTopic,
    NotificationEndpoint,
    NotificationMessageType,
    NotificationService,
    NotificationType,
} from "@sprocketbot/common";
import type {FindManyOptions, FindOneOptions, FindOptionsRelations, QueryRunner} from "typeorm";
import {DataSource, Repository} from "typeorm";

import {PlayerToPlayer} from "$bridge/player_to_player.model";
import {PlayerToUser} from "$bridge/player_to_user.model";
import type {League, ModePreference, Timezone} from "$mledb";
import {LeagueOrdinals, MLE_Player, MLE_PlayerAccount, Role} from "$mledb";
import type {Player} from "$models";
import {
    GameSkillGroupRepository,
    MemberProfiledRepository,
    OrganizationProfiledRepository,
    PlatformRepository,
    PlayerRepository,
    UserAuthenticationAccountRepository,
    UserProfiledRepository,
} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

import type {SalaryPayloadItem} from "../../elo/elo-connector";
import {DegreeOfStiffness, EloConnectorService, EloEndpoint, SkillGroupDelta} from "../../elo/elo-connector";
import type {IntakePlayerAccount} from "./player.resolver";
import type {RankdownJwtPayload} from "./player.types";

@Injectable()
export class PlayerService {
    private readonly logger = new Logger(PlayerService.name);

    constructor(
        private readonly playerRepository: PlayerRepository,
        private readonly userProfiledRepository: UserProfiledRepository,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
        private readonly memberProfiledRepository: MemberProfiledRepository,
        private readonly organizationProfiledRepository: OrganizationProfiledRepository,
        private readonly skillGroupRepository: GameSkillGroupRepository,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
        private readonly eloConnectorService: EloConnectorService,
        private readonly platformRepository: PlatformRepository,
        @InjectRepository(PlayerToUser)
        private readonly ptuRepo: Repository<PlayerToUser>,
        @InjectRepository(PlayerToPlayer)
        private readonly ptpRepo: Repository<PlayerToPlayer>,
        @InjectRepository(MLE_Player)
        private readonly mle_playerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_PlayerAccount)
        private readonly mle_playerAccountRepository: Repository<MLE_PlayerAccount>,
    ) {}

    async getPlayer(query: FindOneOptions<Player>): Promise<Player> {
        return this.playerRepository.findOneOrFail(query);
    }

    async getPlayerById(id: number): Promise<Player> {
        return this.playerRepository.findOneOrFail({where: {id}});
    }

    async getPlayerByOrganizationAndGame(userId: number, organizationId: number, gameId: number): Promise<Player> {
        return this.playerRepository.findOneOrFail({
            where: {
                member: {
                    user: {
                        id: userId,
                    },
                    organization: {
                        id: organizationId,
                    },
                },
                skillGroup: {
                    game: {
                        id: gameId,
                    },
                },
            },
            relations: ["member", "skillGroup"],
        });
    }

    async getPlayerByOrganizationAndGameMode(
        userId: number,
        organizationId: number,
        gameModeId: number,
    ): Promise<Player> {
        return this.playerRepository.findOneOrFail({
            where: {
                member: {
                    user: {
                        id: userId,
                    },
                    organization: {
                        id: organizationId,
                    },
                },
                skillGroup: {
                    game: {
                        modes: {
                            id: gameModeId,
                        },
                    },
                },
            },
            relations: {
                member: {
                    user: true,
                    organization: true,
                },
                skillGroup: {
                    game: {
                        modes: true,
                    },
                },
            },
        });
    }

    async getPlayers(query?: FindManyOptions<Player>): Promise<Player[]> {
        return this.playerRepository.find(query);
    }

    async createPlayer(memberId: number, skillGroupId: number, salary: number): Promise<Player> {
        const member = await this.memberProfiledRepository.primaryRepository.getById(memberId);
        const skillGroup = await this.skillGroupRepository.getById(skillGroupId);
        const player = this.playerRepository.create({
            member,
            skillGroup,
            salary,
        });

        await this.playerRepository.save(player);
        return player;
    }

    /* !! Using repositories due to circular dependency issues. Will fix after extended repositories are added, probably. !! */
    async intakePlayer(
        mleid: number,
        discordId: string,
        name: string,
        skillGroupId: number,
        salary: number,
        platform: string,
        platforms: IntakePlayerAccount[],
        timezone: Timezone,
        modePreference: ModePreference,
    ): Promise<Player> {
        const mleOrg = await this.organizationProfiledRepository.primaryRepository.findOneOrFail({
            where: {profile: {name: "Minor League Esports"}},
            relations: {profile: true},
        });
        const skillGroup = await this.skillGroupRepository.getById(skillGroupId);

        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        let player: Player;

        try {
            const mlePlayer = await this.mle_playerRepository.findOne({where: {mleid}});

            if (mlePlayer) {
                const bridge = await this.ptpRepo.findOneOrFail({where: {mledPlayerId: mlePlayer.id}});
                player = await this.playerRepository.findOneOrFail({
                    where: {id: bridge.sprocketPlayerId},
                    relations: {member: {user: true, profile: true}},
                });

                player = this.playerRepository.merge(player, {skillGroup, salary});
                this.memberProfiledRepository.profileRepository.merge(player.member.profile, {name});

                await runner.manager.save(player);
                await runner.manager.save(player.member.profile);
                await this.mle_updatePlayer(
                    mlePlayer,
                    name,
                    LeagueOrdinals[skillGroup.ordinal - 1],
                    salary,
                    platform,
                    timezone,
                    modePreference,
                    platforms,
                    runner,
                );

                if (skillGroup.id !== player.skillGroupId)
                    await this.eloConnectorService.createJob(EloEndpoint.SGChange, {
                        id: player.id,
                        salary: salary,
                        skillGroup: skillGroup.ordinal,
                    });
            } else {
                const user = this.userProfiledRepository.primaryRepository.create({});

                user.profile = this.userProfiledRepository.profileRepository.create({
                    user: user,
                    email: "unknown@sprocket.gg",
                    displayName: name,
                });
                user.profile.user = user;

                const authAcc = this.userAuthenticationAccountRepository.create({
                    accountType: UserAuthenticationAccountType.DISCORD,
                    accountId: discordId,
                });
                authAcc.user = user;
                user.authenticationAccounts = [authAcc];

                const member = this.memberProfiledRepository.primaryRepository.create({});
                member.organization = mleOrg;
                member.user = user;
                member.profile = this.memberProfiledRepository.profileRepository.create({
                    name: name,
                });
                member.profile.member = member;

                player = this.playerRepository.create({salary});
                player.member = member;
                player.skillGroup = skillGroup;

                await runner.manager.save(user);
                await runner.manager.save(user.profile);
                await runner.manager.save(user.authenticationAccounts);
                await runner.manager.save(member);
                await runner.manager.save(member.profile);
                await runner.manager.save(player);
                await this.mle_createPlayer(
                    user.id,
                    player.id,
                    mleid,
                    discordId,
                    name,
                    LeagueOrdinals[skillGroup.ordinal - 1],
                    salary,
                    platform,
                    timezone,
                    modePreference,
                    platforms,
                    runner,
                );

                await this.eloConnectorService.createJob(EloEndpoint.AddPlayerBySalary, {
                    id: player.id,
                    name: name,
                    salary: salary,
                    skillGroup: skillGroup.ordinal,
                });
            }

            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
            this.logger.error(e);
            throw e;
        } finally {
            await runner.release();
        }

        return player;
    }

    async mle_updatePlayer(
        player: MLE_Player,
        name: string,
        league: League,
        salary: number,
        platform: string,
        timezone: Timezone,
        preference: ModePreference,
        accounts: IntakePlayerAccount[],
        runner?: QueryRunner,
    ): Promise<MLE_Player> {
        const updatedPlayer = this.mle_playerRepository.merge(player, {
            updatedBy: "Sprocket FA Intake",
            name: name,
            salary: salary,
            league: league,
            preferredPlatform: platform,
            timezone: timezone,
            modePreference: preference,
            teamName: "Pend",
            role: Role.NONE,
        });

        const playerAccounts: MLE_PlayerAccount[] = [];
        await Promise.all(
            accounts.map(async a => {
                const currAcc = await this.mle_playerAccountRepository.findOne({
                    where: [
                        {
                            platform: a.platform,
                            platformId: a.platformId,
                            player: {
                                id: player.id,
                            },
                        },
                        {
                            tracker: a.tracker,
                            player: {
                                id: player.id,
                            },
                        },
                    ],
                    relations: {
                        player: true,
                    },
                });
                if (currAcc) return;

                const acc = this.mle_playerAccountRepository.create(a);
                acc.player = player;

                playerAccounts.push(acc);
            }),
        );

        if (runner) {
            await runner.manager.save(player);
            await runner.manager.save(playerAccounts);
        } else {
            await this.mle_playerRepository.save(player);
            await this.mle_playerAccountRepository.save(playerAccounts);
        }

        return updatedPlayer;
    }

    async mle_createPlayer(
        sprocketUserId: number,
        sprocketPlayerId: number,
        mleid: number,
        discordId: string,
        name: string,
        league: League,
        salary: number,
        platform: string,
        timezone: Timezone,
        preference: ModePreference,
        accounts: IntakePlayerAccount[],
        runner?: QueryRunner,
    ): Promise<MLE_Player> {
        let player: MLE_Player = {
            createdBy: "Sprocket FA Intake",
            updatedBy: "Sprocket FA Intake",
            mleid: mleid,
            name: name,
            salary: salary,
            league: league,
            preferredPlatform: platform,
            peakMmr: 0,
            timezone: timezone,
            discordId: discordId,
            modePreference: preference,
            teamName: "Pend",
        } as MLE_Player;

        player = this.mle_playerRepository.create(player);

        const playerAccounts = accounts.map(a => {
            const acc = this.mle_playerAccountRepository.create(a);
            acc.player = player;

            return acc;
        });

        if (runner) {
            await runner.manager.save(player);
            await runner.manager.save(playerAccounts);
        } else {
            await this.mle_playerRepository.save(player);
            await this.mle_playerAccountRepository.save(playerAccounts);
        }

        const ptuBridge = this.ptuRepo.create({
            userId: sprocketUserId,
            playerId: player.id,
        });

        const ptpBridge = this.ptpRepo.create({
            sprocketPlayerId: sprocketPlayerId,
            mledPlayerId: player.id,
        });

        if (runner) {
            await runner.manager.save(ptuBridge);
            await runner.manager.save(ptpBridge);
        } else {
            await this.ptuRepo.save(ptuBridge);
            await this.ptpRepo.save(ptpBridge);
        }

        return player;
    }

    async updatePlayerStanding(playerId: number, salary: number, skillGroupId?: number): Promise<Player> {
        let player = await this.playerRepository.findOneOrFail({
            where: {id: playerId},
        });

        if (skillGroupId) {
            const skillGroup = await this.skillGroupRepository.getById(skillGroupId);

            player = this.playerRepository.merge(player, {salary, skillGroup});
            await this.playerRepository.save(player);
        } else {
            player = this.playerRepository.merge(player, {salary});
            await this.playerRepository.save(player);
        }

        return player;
    }

    buildRankdownNotification(
        userId: number,
        discordId: string,
        orgId: number,
        orgName: string,
        oldSkillGroupName: string,
        newSkillGroupName: string,
        salary: number,
    ): NotificationInput<NotificationEndpoint.SendNotification> {
        return {
            type: NotificationType.BASIC,
            userId: userId,
            notification: {
                type: NotificationMessageType.DirectMessage,
                userId: discordId,
                payload: {
                    embeds: [
                        {
                            title: "You Have Ranked Out",
                            description: `You have been ranked out from ${oldSkillGroupName} to ${newSkillGroupName}.`,
                            author: {
                                name: `${orgName}`,
                            },
                            fields: [
                                {
                                    name: "New League",
                                    value: `${newSkillGroupName}`,
                                },
                                {
                                    name: "New Salary",
                                    value: `${salary}`,
                                },
                            ],
                            footer: {
                                text: orgName,
                            },
                            timestamp: Date.now(),
                        },
                    ],
                },
                brandingOptions: {
                    organizationId: orgId,
                    options: {
                        author: {
                            icon: true,
                        },
                        color: true,
                        thumbnail: true,
                        footer: {
                            icon: true,
                        },
                    },
                },
            },
        };
    }

    async saveSalaries(payload: SalaryPayloadItem[][]): Promise<void> {
        await Promise.allSettled(
            payload.map(async payloadSkillGroup =>
                Promise.allSettled(
                    payloadSkillGroup.map(async playerDelta => {
                        const player = await this.getPlayer({
                            where: {id: playerDelta.playerId},
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
                        });

                        const bridge = await this.ptpRepo.findOneOrFail({where: {sprocketPlayerId: player.id}});
                        const mlePlayer = await this.mle_playerRepository.findOneOrFail({
                            where: {id: bridge.mledPlayerId},
                        });

                        if (mlePlayer.teamName === "FP") return;
                        if (!playerDelta.rankout && player.salary === playerDelta.newSalary) return;

                        const discordAccount = await this.userAuthenticationAccountRepository.getDiscordAccountByUserId(
                            player.member.user.id,
                        );
                        const orgProfile =
                            await this.organizationProfiledRepository.profileRepository.getByOrganizationId(
                                player.member.organization.id,
                            );

                        if (playerDelta.rankout) {
                            if (playerDelta.rankout.degreeOfStiffness === DegreeOfStiffness.HARD) {
                                const skillGroup = await this.skillGroupRepository.get({
                                    where: {
                                        game: {
                                            id: player.skillGroup.game.id,
                                        },
                                        organization: {
                                            id: player.skillGroup.organization.id,
                                        },
                                        ordinal:
                                            player.skillGroup.ordinal -
                                            (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP ? 1 : -1),
                                    },
                                    relations: {
                                        profile: true,
                                        game: true,
                                        organization: true,
                                    },
                                });

                                await this.updatePlayerStanding(
                                    playerDelta.playerId,
                                    playerDelta.rankout.salary,
                                    skillGroup.id,
                                );

                                if (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP) {
                                    await this.mle_rankUpPlayer(player.id, playerDelta.rankout.salary);
                                } else {
                                    await this.mle_rankDownPlayer(player.id, playerDelta.rankout.salary);
                                }

                                await this.eventsService.publish(EventTopic.PlayerSkillGroupChanged, {
                                    playerId: player.id,
                                    name: player.member.profile.name,
                                    organizationId: skillGroup.organization.id,
                                    discordId: discordAccount.accountId,
                                    old: {
                                        id: player.skillGroup.id,
                                        name: player.skillGroup.profile.description,
                                        salary: player.salary,
                                        discordEmojiId: player.skillGroup.profile.discordEmojiId,
                                    },
                                    new: {
                                        id: skillGroup.id,
                                        name: skillGroup.profile.description,
                                        salary: playerDelta.rankout.salary,
                                        discordEmojiId: skillGroup.profile.discordEmojiId,
                                    },
                                });

                                await this.notificationService.send(
                                    NotificationEndpoint.SendNotification,
                                    this.buildRankdownNotification(
                                        player.member.user.id,
                                        discordAccount.accountId,
                                        player.member.organization.id,
                                        orgProfile.name,
                                        player.skillGroup.profile.description,
                                        skillGroup.profile.description,
                                        playerDelta.rankout.salary,
                                    ),
                                );
                            } else {
                                await this.updatePlayerStanding(playerDelta.playerId, playerDelta.rankout.salary);

                                const skillGroup = await this.skillGroupRepository.get({
                                    where: {
                                        game: {
                                            id: player.skillGroup.game.id,
                                        },
                                        organization: {
                                            id: player.skillGroup.organization.id,
                                        },
                                        ordinal:
                                            player.skillGroup.ordinal -
                                            (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP ? 1 : -1),
                                    },
                                    relations: {
                                        profile: true,
                                        organization: true,
                                        game: true,
                                    },
                                });

                                /* TEMPORARY NOTIFICATION */
                                const rankdownPayload: RankdownJwtPayload = {
                                    playerId: player.id,
                                    salary: playerDelta.rankout.salary,
                                    skillGroupId: skillGroup.id,
                                };
                                const jwt = this.jwtService.sign(rankdownPayload, {expiresIn: "24h"});

                                await this.notificationService.send(NotificationEndpoint.SendNotification, {
                                    type: NotificationType.BASIC,
                                    userId: player.member.user.id,
                                    notification: {
                                        type: NotificationMessageType.DirectMessage,
                                        userId: discordAccount.accountId,
                                        payload: {
                                            embeds: [
                                                {
                                                    title: "Rankdown Available",
                                                    description: `You have been offered a rankout from ${player.skillGroup.profile.description} to ${skillGroup.profile.description}.\n\n‼️‼️**__Only click the button below if you accept the rankdown. There is no confirmation.__**‼️‼️`,
                                                    author: {
                                                        name: `${orgProfile.name}`,
                                                    },
                                                    fields: [
                                                        {
                                                            name: "New League",
                                                            value: `${skillGroup.profile.description}`,
                                                        },
                                                        {
                                                            name: "New Salary",
                                                            value: `${playerDelta.rankout.salary}`,
                                                        },
                                                    ],
                                                    footer: {
                                                        text: orgProfile.name,
                                                    },
                                                    timestamp: Date.now(),
                                                },
                                            ],
                                            components: [
                                                {
                                                    type: ComponentType.ACTION_ROW,
                                                    components: [
                                                        {
                                                            type: ComponentType.BUTTON,
                                                            style: ButtonComponentStyle.LINK,
                                                            label: "ONLY CLICK HERE IF YOU ACCEPT",
                                                            url: `${config.web.api_root}/player/accept-rankdown/${jwt}`,
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        brandingOptions: {
                                            organizationId: player.member.organization.id,
                                            options: {
                                                author: {
                                                    icon: true,
                                                },
                                                color: true,
                                                thumbnail: true,
                                                footer: {
                                                    icon: true,
                                                },
                                            },
                                        },
                                    },
                                });
                            }
                        } else {
                            await this.updatePlayerStanding(playerDelta.playerId, playerDelta.newSalary);
                        }
                    }),
                ),
            ),
        );
    }

    mle_nextLeague(league: League, dir: -1 | 1): League {
        return LeagueOrdinals[LeagueOrdinals.indexOf(league) - dir];
    }

    async mle_movePlayerToLeague(sprocPlayerId: number, salary: number, skillGroupId: number): Promise<MLE_Player> {
        const sprocketPlayer = await this.getPlayer({
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
        const discId = sprocketPlayer.member.user.authenticationAccounts.find(
            aa => aa.accountType === UserAuthenticationAccountType.DISCORD,
        );
        if (!discId) throw new Error("No discord Id");

        const sg = await this.skillGroupRepository.getById(skillGroupId);

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });

        if (sg.ordinal > sprocketPlayer.skillGroup.ordinal) {
            player = this.mle_playerRepository.merge(player, {
                role: Role.NONE,
                teamName: "Waivers",
                league: LeagueOrdinals[sg.ordinal - 1],
                salary: salary,
            });
        } else {
            player = this.mle_playerRepository.merge(player, {
                role: Role.NONE,
                league: LeagueOrdinals[sg.ordinal - 1],
                salary: salary,
            });
        }

        await this.mle_playerRepository.save(player);

        return player;
    }

    async mle_rankDownPlayer(sprocPlayerId: number, salary: number): Promise<MLE_Player> {
        const sprocketPlayer = await this.getPlayer({
            where: {id: sprocPlayerId},
            relations: {
                member: {
                    profile: true,
                    user: {
                        authenticationAccounts: true,
                    },
                },
            },
        });
        const discId = sprocketPlayer.member.user.authenticationAccounts.find(
            aa => aa.accountType === UserAuthenticationAccountType.DISCORD,
        );
        if (!discId) throw new Error("No discord Id");

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });
        const oldTeamName = player.teamName;

        player = this.mle_playerRepository.merge(player, {
            role: Role.NONE,
            teamName: "Waivers",
            league: this.mle_nextLeague(player.league, -1),
            salary: salary,
        });

        await this.mle_playerRepository.save(player);

        // Move player to Waiver Wire
        // TODO fix later when we abstract away from MLE
        await this.eventsService.publish(EventTopic.PlayerTeamChanged, {
            organizationId: sprocketPlayer.member.organizationId,
            discordId: discId.accountId,
            playerId: sprocketPlayer.id,
            name: sprocketPlayer.member.profile.name,
            old: {
                name: oldTeamName,
            },
            new: {
                name: "Waivers",
            },
        });

        return player;
    }

    async mle_rankUpPlayer(sprocPlayerId: number, salary: number): Promise<MLE_Player> {
        const sproc = await this.getPlayer({
            where: {id: sprocPlayerId},
            relations: {
                member: {
                    user: {
                        authenticationAccounts: true,
                    },
                },
            },
        });
        const discId = sproc.member.user.authenticationAccounts.find(
            aa => aa.accountType === UserAuthenticationAccountType.DISCORD,
        );
        if (!discId) throw new Error("No discord Id");

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });

        player = this.mle_playerRepository.merge(player, {
            role: Role.NONE,
            league: this.mle_nextLeague(player.league, 1),
            salary: salary,
        });

        await this.mle_playerRepository.save(player);
        return player;
    }

    // Have this because circular dependencies suck. Temp only for MLEDB integration so /shrug
    // Can refactor after extended repos is a thing
    async getMlePlayerBySprocketPlayer(playerId: number): Promise<MLE_Player> {
        const bridge = await this.ptpRepo.findOneOrFail({where: {sprocketPlayerId: playerId}});
        return this.mle_playerRepository.findOneOrFail({where: {id: bridge.mledPlayerId}});
    }

    async getPlayerByGameAndPlatform(
        gameId: number,
        platformId: number,
        platformAccountId: string,
        relations?: FindOptionsRelations<Player>,
    ): Promise<Player> {
        return this.playerRepository.findOneOrFail({
            where: {
                skillGroup: {
                    game: {
                        id: gameId,
                    },
                },
                member: {
                    platformAccounts: {
                        platform: {
                            id: platformId,
                        },
                        platformAccountId: platformAccountId,
                    },
                },
            },
            relations: Object.assign(
                {
                    skillGroup: {
                        game: true,
                    },
                    member: {
                        user: true,
                        platformAccounts: {
                            platform: true,
                        },
                    },
                },
                relations,
            ),
        });
    }

    async getPlayerByGameAndPlatformPayload(data: {
        platform: string;
        platformId: string;
        gameId: number;
    }): Promise<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>> {
        try {
            const platform = await this.platformRepository.get({where: {code: data.platform}});
            const player = await this.getPlayerByGameAndPlatform(data.gameId, platform.id, data.platformId);
            const mlePlayer = await this.getMlePlayerBySprocketPlayer(player.id);

            return {
                success: true,
                data: {
                    id: player.id,
                    userId: player.member.user.id,
                    skillGroupId: player.skillGroupId,
                    franchise: {
                        name: mlePlayer.teamName,
                    },
                },
                request: data,
            };
        } catch {
            return {
                success: false,
                request: data,
            };
        }
    }
}
