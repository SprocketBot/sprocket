import {
    Controller, forwardRef, Get, Inject, Param,
} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {InjectRepository} from "@nestjs/typeorm";
import type {CoreOutput} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreSchemas,
    EventsService,
    EventTopic,
    NotificationEndpoint,
    NotificationMessageType,
    NotificationService,
    NotificationType,
} from "@sprocketbot/common";
import {Repository} from "typeorm";

import {UserAuthenticationAccount, UserAuthenticationAccountType} from "../../database";
import type {ManualSkillGroupChange} from "../../elo/elo-connector";
import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {GameService, PlatformService} from "../../game";
import {OrganizationService} from "../../organization";
import {GameSkillGroupService} from "../game-skill-group";
import {PlayerService} from "./player.service";

export interface RankdownPayload {
    playerId: number;
    salary: number;
    skillGroupId: number;
}

@Controller("player")
export class PlayerController {
    constructor(
        private readonly eloConnectorService: EloConnectorService,
        private readonly jwtService: JwtService,
        private readonly playerService: PlayerService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly gameService: GameService,
        private readonly platformService: PlatformService,
        @InjectRepository(UserAuthenticationAccount) private userAuthRepository: Repository<UserAuthenticationAccount>,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
    ) {}

    @Get("accept-rankdown/:token")
    async acceptRankdown(@Param("token") token: string): Promise<string> {
        const payload = this.jwtService.decode(token) as RankdownPayload | null;
        if (!payload) return "FAILED TO DECODE PAYLOAD";

        const player = await this.playerService.getPlayer({
            where: {id: payload.playerId},
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

        const skillGroup = await this.skillGroupService.getGameSkillGroup({
            where: {
                id: payload.skillGroupId,
            },
            relations: {
                profile: true,
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

        if (player.skillGroup.id === payload.skillGroupId) return "ERROR: You are already in this skill group";

        const inputData: ManualSkillGroupChange = {
            id: payload.playerId,
            salary: payload.salary,
            skillGroup: skillGroup.ordinal,
        };
        
        await this.playerService.updatePlayerStanding(payload.playerId, payload.salary, payload.skillGroupId);
        await this.playerService.mle_rankDownPlayer(payload.playerId, payload.salary);
        await this.eloConnectorService.createJob(EloEndpoint.SGChange, inputData);

        await this.eventsService.publish(EventTopic.PlayerSkillGroupChanged, {
            playerId: player.id,
            name: player.member.profile.name,
            organizationId: player.skillGroup.organizationId,
            discordId: discordAccount.accountId,
            old: {
                id: player.skillGroup.id,
                name: player.skillGroup.profile.description,
                salary: Number(player.salary),
                discordEmojiId: player.skillGroup.profile.discordEmojiId,
            },
            new: {
                id: skillGroup.id,
                name: skillGroup.profile.description,
                salary: Number(payload.salary),
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
                                value: `${payload.salary}`,
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

        return "SUCCESS";
    }

    @MessagePattern(CoreEndpoint.GetPlayerByPlatformId)
    async getPlayerByPlatformId(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>> {
        const data = CoreSchemas[CoreEndpoint.GetPlayerByPlatformId].input.parse(payload);

        const game = await this.gameService.getGameById(data.gameId);
        const platform = await this.platformService.getPlatformByCode(data.platform);
        const player = await this.playerService.getPlayerByGameAndPlatform(game.id, platform.id, data.platformId).catch(() => null);

        if (!player) return {
            success: false,
            request: data,
        };

        const mlePlayer = await this.playerService.getMlePlayerBySprocketPlayer(player.id);

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
    }

    @MessagePattern(CoreEndpoint.GetPlayersByPlatformIds)
    async getPlayersByPlatformIds(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayersByPlatformIds>> {
        const data = CoreSchemas[CoreEndpoint.GetPlayersByPlatformIds].input.parse(payload);

        const allResults = await Promise.allSettled(data.map(async p => {
            const game = await this.gameService.getGameById(p.gameId);
            const platform = await this.platformService.getPlatformByCode(p.platform);
            const player = await this.playerService.getPlayerByGameAndPlatform(game.id, platform.id, p.platformId).catch(() => null);
    
            if (!player) return {
                success: false,
                error: `Failed to find player by account platform=${p.platform} platformId=${p.platformId}`,
                request: p,
            };
    
            const mlePlayer = await this.playerService.getMlePlayerBySprocketPlayer(player.id);
    
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
                request: p,
            };
        }));

        if (allResults.every(r => r.status === "fulfilled")) {
            return allResults.map(r => (r as PromiseFulfilledResult<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>>).value);
        }

        throw new Error(`Failed to fetch players by platform accounts: ${
            allResults.filter(r => r.status === "rejected").map(failed => {
                const result = failed as PromiseRejectedResult;
                return (result.reason as Error).message;
            })
                .join(", ")
        }`);
    }
}
