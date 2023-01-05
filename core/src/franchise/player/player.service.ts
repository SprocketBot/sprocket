import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
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
import type {SalaryPayload} from "@sprocketbot/elo-connector";
import type {FindOptionsRelations} from "typeorm";

import {PlatformRepository} from "../../game/database/platform.repository";
import {UserAuthenticationAccountRepository} from "../../identity/database/user-authentication-account.repository";
import {MledbPlayerService} from "../../mledb/mledb-player/mledb-player.service";
import {GameSkillGroupRepository} from "../database/game-skill-group.repository";
import type {Player} from "../database/player.entity";
import {PlayerRepository} from "../database/player.repository";
import type {RankdownJwtPayload} from "../schemas/RankdownJwt.schema";

@Injectable()
export class PlayerService {
    constructor(
        private readonly playerRepository: PlayerRepository,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
        private readonly skillGroupRepository: GameSkillGroupRepository,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly jwtService: JwtService,
        private readonly platformRepository: PlatformRepository,
        @Inject(forwardRef(() => MledbPlayerService)) private readonly mlePlayerService: MledbPlayerService,
    ) {}

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

    async updatePlayerStanding(playerId: number, salary: number, skillGroupId?: number): Promise<Player> {
        let player = await this.playerRepository.findOneOrFail({
            where: {id: playerId},
        });

        if (skillGroupId) {
            const skillGroup = await this.skillGroupRepository.findById(skillGroupId);

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

    async saveSalaries(players: SalaryPayload[]): Promise<void> {
        await Promise.allSettled(
            players.map(async payload => {
                const player = await this.playerRepository.findOneOrFail({
                    where: {id: payload.playerId},
                    relations: {
                        member: {
                            user: {
                                authenticationAccounts: true,
                            },
                            organization: {
                                profile: true,
                            },
                            profile: true,
                        },
                        skillGroup: {
                            organization: true,
                            game: true,
                            profile: true,
                        },
                    },
                });

                if (
                    player.member.organization.profile.name === "Minor League Esports" &&
                    (await this.mlePlayerService.playerIsFormerPlayer(player.id))
                )
                    return;

                if (!payload.rankout && player.salary === payload.salary) return;

                const discordAccount = await this.userAuthenticationAccountRepository.getDiscordAccountByUserId(
                    player.member.user.id,
                );

                if (payload.rankout) {
                    if (payload.rankout.forced) {
                        const skillGroup = await this.skillGroupRepository.findOneOrFail({
                            where: {id: payload.rankout.skillGroupId},
                            relations: {
                                profile: true,
                                game: true,
                                organization: true,
                            },
                        });

                        await this.updatePlayerStanding(payload.playerId, payload.rankout.salary, skillGroup.id);

                        if (player.member.organization.profile.name === "Minor League Esports") {
                            await this.mlePlayerService.movePlayerToLeague(
                                player.id,
                                skillGroup.id,
                                payload.rankout.salary,
                            );
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
                                salary: payload.rankout.salary,
                                discordEmojiId: skillGroup.profile.discordEmojiId,
                            },
                        });

                        await this.notificationService.send(
                            NotificationEndpoint.SendNotification,
                            this.buildRankdownNotification(
                                player.member.user.id,
                                discordAccount.accountId,
                                player.member.organization.id,
                                player.member.organization.profile.name,
                                player.skillGroup.profile.description,
                                skillGroup.profile.description,
                                payload.rankout.salary,
                            ),
                        );
                    } else {
                        await this.updatePlayerStanding(payload.playerId, payload.salary);

                        const skillGroup = await this.skillGroupRepository.findOneOrFail({
                            where: {id: payload.rankout.skillGroupId},
                            relations: {
                                profile: true,
                                organization: true,
                                game: true,
                            },
                        });

                        /* TEMPORARY NOTIFICATION */
                        const rankdownPayload: RankdownJwtPayload = {
                            playerId: player.id,
                            salary: payload.rankout.salary,
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
                                                name: `${player.member.organization.profile.name}`,
                                            },
                                            fields: [
                                                {
                                                    name: "New League",
                                                    value: `${skillGroup.profile.description}`,
                                                },
                                                {
                                                    name: "New Salary",
                                                    value: `${payload.rankout.salary}`,
                                                },
                                            ],
                                            footer: {
                                                text: player.member.organization.profile.name,
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
                    await this.updatePlayerStanding(payload.playerId, payload.salary);

                    if (player.member.organization.profile.name === "Minor League Esports") {
                        await this.mlePlayerService.updatePlayerSalary(player.id, payload.salary);
                    }
                }
            }),
        );
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
            const platform = await this.platformRepository.findOneOrFail({where: {code: data.platform}});
            const player = await this.getPlayerByGameAndPlatform(data.gameId, platform.id, data.platformId);
            const mlePlayer = await this.mlePlayerService.getMlePlayerBySprocketPlayer(player.id);

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

    async playerCanSaveDemos(playerId: number): Promise<boolean> {
        const player = await this.playerRepository
            .createQueryBuilder("player")
            .innerJoinAndSelect("player.skillGroup", "skillGroup")
            .innerJoinAndSelect("skillGroup.game", "game")
            .innerJoinAndSelect("player.member", "member")
            .innerJoinAndSelect("member.platformAccounts", "platformAccount")
            .innerJoinAndSelect("platformAccount.platform", "platform")
            .innerJoinAndSelect("platform.supportedGames", "supportedGame", "supportedGame.gameId = game.id")
            .where("player.id = :id", {id: playerId})
            .andWhere("supportedGame.canSaveDemos = true")
            .getOne();

        return Boolean(player?.member.platformAccounts.length);
    }
}
