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
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {
    Player, UserAuthenticationAccount, UserAuthenticationAccountType,
} from "../../database";
import type {League} from "../../database/mledb";
import {
    LeagueOrdinals, MLE_Player, Role,
} from "../../database/mledb";
import type {SalaryPayloadItem} from "../../elo/elo-connector";
import {DegreeOfStiffness, SkillGroupDelta} from "../../elo/elo-connector";
import {OrganizationService} from "../../organization";
import {MemberService} from "../../organization/member/member.service";
import {GameSkillGroupService} from "../game-skill-group";
import type {RankdownPayload} from "./player.controller";

@Injectable()
export class PlayerService {
    private readonly logger = new Logger(PlayerService.name);

    constructor(
        @InjectRepository(Player) private playerRepository: Repository<Player>,
        @InjectRepository(MLE_Player) private mle_playerRepository: Repository<MLE_Player>,
        @InjectRepository(UserAuthenticationAccount) private userAuthRepository: Repository<UserAuthenticationAccount>,
        @Inject(forwardRef(() => MemberService)) private readonly memberService: MemberService,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly jwtService: JwtService,
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

    async mle_MovePlayerToLeague(sprocPlayerId: number, salary: number, skillGroupId: number): Promise<MLE_Player> {
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

        const sg = await this.skillGroupService.getGameSkillGroupById(skillGroupId);

        let player = await this.mle_playerRepository.findOneOrFail({
            where: {
                discordId: discId.accountId,
            },
        });

        player = this.mle_playerRepository.merge(player, {
            role: Role.NONE,
            teamName: "WW",
            league: LeagueOrdinals[sg.ordinal - 1],
            salary: salary,
        });

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
