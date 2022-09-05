import {
    forwardRef, Inject, Injectable, Logger,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {
    ButtonComponentStyle,
    ComponentType,
    config,
    EventsService,
    NanoidService,
    NotificationEndpoint,
    NotificationMessageType,
    NotificationService,
    NotificationType,
} from "@sprocketbot/common";
import {add} from "date-fns";
import type {FindManyOptions, FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {
    Player, UserAuthenticationAccount, UserAuthenticationAccountType,
} from "../../database";
import type {SalaryPayloadItem} from "../../elo/elo-connector";
import {DegreeOfStiffness, SkillGroupDelta} from "../../elo/elo-connector";
import {OrganizationService} from "../../organization";
import {MemberService} from "../../organization/member/member.service";
import {GameSkillGroupService} from "../game-skill-group";

@Injectable()
export class PlayerService {
    private readonly logger = new Logger(PlayerService.name);

    constructor(
        @InjectRepository(Player) private playerRepository: Repository<Player>,
        @InjectRepository(UserAuthenticationAccount) private userAuthRepository: Repository<UserAuthenticationAccount>,
        @Inject(forwardRef(() => MemberService)) private readonly memberService: MemberService,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
        private readonly nanoidService: NanoidService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
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

                    const notifId = `${NotificationType.RANKDOWN.toLowerCase()}-${this.nanoidService.gen()}`;
    
                    await this.notificationService.send(NotificationEndpoint.SendNotification, {
                        id: notifId,
                        type: NotificationType.RANKDOWN,
                        userId: player.member.user.id,
                        expiration: add(new Date(), {hours: 24}),
                        payload: {
                            playerId: playerDelta.playerId,
                            skillGroupId: skillGroup.id,
                            salary: playerDelta.newSalary,
                        },
                        notification: {
                            type: NotificationMessageType.DirectMessage,
                            userId: discordAccount.accountId,
                            payload: {
                                embeds: [ {
                                    title: "Rankdown Available",
                                    description: `You have been offered a rankout from ${player.skillGroup.profile.description} to ${skillGroup.profile.description}.`,
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
                                            label: "Accept it here!",
                                            url: `${config.web.url}/notifications/${notifId}`,
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
                }
            } else {
                await this.updatePlayerStanding(playerDelta.playerId, playerDelta.newSalary);
            }
        }))));
    }
}
