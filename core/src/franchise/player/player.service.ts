import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
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
import type {
    FindManyOptions, FindOneOptions, QueryRunner,
} from "typeorm";
import {DataSource, Repository} from "typeorm";

import {
    Member,
    MemberProfile,
    Organization,
    Player,
    User,
    UserAuthenticationAccount,
    UserAuthenticationAccountType,
    UserProfile,
} from "../../database";
import type {
    League,
    ModePreference,
    Timezone,
} from "../../database/mledb";
import {
    LeagueOrdinals,
    MLE_Player,
    MLE_PlayerAccount,
    Role,
} from "../../database/mledb";
import {PlayerToPlayer} from "../../database/mledb-bridge/player_to_player.model";
import {PlayerToUser} from "../../database/mledb-bridge/player_to_user.model";
import type {SalaryPayloadItem} from "../../elo/elo-connector";
import {
    DegreeOfStiffness,
    EloConnectorService,
    EloEndpoint,
    SkillGroupDelta,
} from "../../elo/elo-connector";
import {OrganizationService} from "../../organization";
import {MemberService} from "../../organization/member/member.service";
import {GameSkillGroupService} from "../game-skill-group";
import type {RankdownPayload} from "./player.controller";
import type {IntakePlayerAccount} from "./player.resolver";

@Injectable()
export class PlayerService {
    private readonly logger = new Logger(PlayerService.name);

    constructor(
        @InjectRepository(Player) private playerRepository: Repository<Player>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
        @InjectRepository(Member) private memberRepository: Repository<Member>,
        @InjectRepository(MemberProfile) private memberProfileRepository: Repository<MemberProfile>,
        @InjectRepository(UserAuthenticationAccount) private userAuthRepository: Repository<UserAuthenticationAccount>,
        @InjectRepository(Organization) private organizationRepository: Repository<Organization>,
        @InjectRepository(PlayerToUser) private readonly ptuRepo: Repository<PlayerToUser>,
        @InjectRepository(PlayerToPlayer) private readonly ptpRepo: Repository<PlayerToPlayer>,
        @InjectRepository(MLE_Player) private mle_playerRepository: Repository<MLE_Player>,
        @InjectRepository(MLE_PlayerAccount) private mle_playerAccountRepository: Repository<MLE_PlayerAccount>,
        @Inject(forwardRef(() => MemberService)) private readonly memberService: MemberService,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
        private readonly eloConnectorService: EloConnectorService,
    ) {}

    async getPlayer(query: FindOneOptions<Player>): Promise<Player> {
        return this.playerRepository.findOneOrFail(query);
    }

    async getPlayerById(id: number): Promise<Player> {
        return this.playerRepository.findOneOrFail({where: {id} });
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

    async getPlayerByOrganizationAndGameMode(userId: number, organizationId: number, gameModeId: number): Promise<Player> {
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
        const member = await this.memberService.getMemberById(memberId);
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(skillGroupId);
        const player = this.playerRepository.create({
            member, skillGroup, salary,
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
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        let player: Player;

        try {
            const user = this.userRepository.create({});
            
            user.profile = this.userProfileRepository.create({
                user: user,
                email: "unknown@sprocket.gg",
                displayName: name,
            });
            user.profile.user = user;

            const authAcc = this.userAuthRepository.create({
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: discordId,
            });
            authAcc.user = user;
            user.authenticationAccounts = [authAcc];

            const mleOrg = await this.organizationRepository.findOneOrFail({where: {profile: {name: "Minor League Esports"} } });

            const member = this.memberRepository.create({});
            member.organization = mleOrg;
            member.user = user;
            member.profile = this.memberProfileRepository.create({
                name: name,
            });
            member.profile.member = member;

            const skillGroup = await this.skillGroupService.getGameSkillGroupById(skillGroupId);

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
            await this.mle_playerAccountRepository.save(player);
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
        let player = await this.playerRepository.findOneOrFail({where: {id: playerId} });
        
        if (skillGroupId) {
            const skillGroup = await this.skillGroupService.getGameSkillGroupById(skillGroupId);

            player = this.playerRepository.merge(player, {salary, skillGroup});
            await this.playerRepository.save(player);
        } else {
            player = this.playerRepository.merge(player, {salary});
            await this.playerRepository.save(player);
        }

        return player;
    }

    async saveSalaries(payload: SalaryPayloadItem[][]): Promise<void> {
        await Promise.allSettled(payload.map(async payloadSkillGroup => Promise.allSettled(payloadSkillGroup.map(async playerDelta => {
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

            const bridge = await this.ptpRepo.findOneOrFail({where: {sprocketPlayerId: player.id} });
            const mlePlayer = await this.mle_playerRepository.findOneOrFail({where: {id: bridge.mledPlayerId} });
            
            if (mlePlayer.teamName === "FP") return;
            if (!playerDelta.rankout && player.salary === playerDelta.newSalary) return;
    
            const discordAccount = await this.userAuthRepository.findOneOrFail({
                where: {
                    user: {
                        id: player.member.user.id,
                    },
                    accountType: UserAuthenticationAccountType.DISCORD,
                },
            });
            const orgProfile = await this.organizationService.getOrganizationProfileForOrganization(player.member.organization.id);

            if (playerDelta.rankout) {
                if (playerDelta.rankout.degreeOfStiffness === DegreeOfStiffness.HARD) {
                    const skillGroup = await this.skillGroupService.getGameSkillGroup({
                        where: {
                            game: {
                                id: player.skillGroup.game.id,
                            },
                            organization: {
                                id: player.skillGroup.organization.id,
                            },
                            ordinal: player.skillGroup.ordinal - (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP ? 1 : -1),
                        },
                        relations: {
                            profile: true,
                            game: true,
                            organization: true,
                        },
                    });
    
                    await this.updatePlayerStanding(playerDelta.playerId, playerDelta.rankout.salary, skillGroup.id);

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
    
                    await this.notificationService.send(NotificationEndpoint.SendNotification, {
                        type: NotificationType.BASIC,
                        userId: player.member.user.id,
                        notification: {
                            type: NotificationMessageType.DirectMessage,
                            userId: discordAccount.accountId,
                            payload: {
                                embeds: [ {
                                    title: "You Have Ranked Out",
                                    description: `You have been ranked out from ${player.skillGroup.profile.description} to ${skillGroup.profile.description}.`,
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
                                } ],
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
                } else if (playerDelta.rankout.degreeOfStiffness === DegreeOfStiffness.SOFT) {
                    await this.updatePlayerStanding(playerDelta.playerId, playerDelta.rankout.salary);

                    const skillGroup = await this.skillGroupService.getGameSkillGroup({
                        where: {
                            game: {
                                id: player.skillGroup.game.id,
                            },
                            organization: {
                                id: player.skillGroup.organization.id,
                            },
                            ordinal: player.skillGroup.ordinal - (playerDelta.rankout.skillGroupChange === SkillGroupDelta.UP ? 1 : -1),
                        },
                        relations: {
                            profile: true,
                            organization: true,
                            game: true,
                        },
                    });

                    /* TEMPORARY NOTIFICATION */
                    const rankdownPayload: RankdownPayload = {
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
                                embeds: [ {
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
                                } ],
                                components: [ {
                                    type: ComponentType.ACTION_ROW,
                                    components: [
                                        {
                                            type: ComponentType.BUTTON,
                                            style: ButtonComponentStyle.LINK,
                                            label: "ONLY CLICK HERE IF YOU ACCEPT",
                                            url: `${config.web.api_root}/player/accept-rankdown/${jwt}`,
                                        },
                                    ],
                                } ],
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
                    /* /TEMPORARY NOTIFICATION/ */

                    // const notifId = `${NotificationType.RANKDOWN.toLowerCase()}-${this.nanoidService.gen()}`;
    
                    // await this.notificationService.send(NotificationEndpoint.SendNotification, {
                    //     id: notifId,
                    //     type: NotificationType.RANKDOWN,
                    //     userId: player.member.user.id,
                    //     expiration: add(new Date(), {hours: 24}),
                    //     payload: {
                    //         playerId: playerDelta.playerId,
                    //         skillGroupId: skillGroup.id,
                    //         salary: playerDelta.newSalary,
                    //     },
                    //     notification: {
                    //         type: NotificationMessageType.DirectMessage,
                    //         userId: discordAccount.accountId,
                    //         payload: {
                    //             embeds: [ {
                    //                 title: "Rankdown Available",
                    //                 description: `You have been offered a rankout from ${player.skillGroup.profile.description} to ${skillGroup.profile.description}.`,
                    //                 author: {
                    //                     name: `${orgProfile.name}`,
                    //                 },
                    //                 fields: [
                    //                     {
                    //                         name: "New League",
                    //                         value: `${skillGroup.profile.description}`,
                    //                     },
                    //                     {
                    //                         name: "New Salary",
                    //                         value: `${playerDelta.rankout.salary}`,
                    //                     },
                    //                 ],
                    //                 footer: {
                    //                     text: orgProfile.name,
                    //                 },
                    //                 timestamp: Date.now(),
                    //             } ],
                    //             components: [ {
                    //                 type: ComponentType.ACTION_ROW,
                    //                 components: [
                    //                     {
                    //                         type: ComponentType.BUTTON,
                    //                         style: ButtonComponentStyle.LINK,
                    //                         label: "Accept it here!",
                    //                         url: `${config.web.url}/notifications/${notifId}`,
                    //                     },
                    //                 ],
                    //             } ],
                    //         },
                    //         brandingOptions: {
                    //             organizationId: player.member.organization.id,
                    //             options: {
                    //                 author: {
                    //                     icon: true,
                    //                 },
                    //                 color: true,
                    //                 thumbnail: true,
                    //                 footer: {
                    //                     icon: true,
                    //                 },
                    //             },
                    //         },
                    //     },
                    // });
                }
            } else {
                await this.updatePlayerStanding(playerDelta.playerId, playerDelta.newSalary);
            }
        }))));
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
        const discId = sprocketPlayer.member.user.authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);
        if (!discId) throw new Error("No discord Id");

        const sg = await this.skillGroupService.getGameSkillGroupById(skillGroupId);

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });

        if (sg.ordinal > sprocketPlayer.skillGroup.ordinal) {
            player = this.mle_playerRepository.merge(player, {
                role: Role.NONE,
                teamName: "WW",
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
        const discId = sprocketPlayer.member.user.authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);
        if (!discId) throw new Error("No discord Id");

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });
        const oldTeamName = player.teamName;

        player = this.mle_playerRepository.merge(player, {
            role: Role.NONE,
            teamName: "WW",
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
        const discId = sproc.member.user.authenticationAccounts.find(aa => aa.accountType === UserAuthenticationAccountType.DISCORD);
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
}
