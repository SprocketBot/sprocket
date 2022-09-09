import {
    Controller, forwardRef, Get, Inject, Param,
} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import {
    EventsService, EventTopic, NotificationEndpoint, NotificationMessageType, NotificationService, NotificationType,
} from "@sprocketbot/common";
import {Repository} from "typeorm";

import {UserAuthenticationAccount, UserAuthenticationAccountType} from "../../database";
import type {ManualSkillGroupChange} from "../../elo/elo-connector";
import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
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
        @InjectRepository(UserAuthenticationAccount) private userAuthRepository: Repository<UserAuthenticationAccount>,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
    ) {}

    @Get("accept-rankdown/:token")
    async acceptRankdown(@Param("token") token: string): Promise<string> {
        const payload = this.jwtService.decode(token) as RankdownPayload | null;
        if (!payload) return "FAILED TO DECODE PAYLOAD";

        const sg = await this.skillGroupService.getGameSkillGroupById(payload.skillGroupId);

        await this.playerService.updatePlayerStanding(payload.playerId, payload.salary, payload.skillGroupId);

        const inputData: ManualSkillGroupChange = {
            id: payload.playerId,
            salary: payload.salary,
            skillGroup: sg.ordinal,
        };

        await this.eloConnectorService.createJob(EloEndpoint.SGChange, inputData);

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

        await this.eventsService.publish(EventTopic.PlayerSkillGroupChanged, {
            playerId: player.id,
            name: player.member.profile.name,
            old: {
                id: player.skillGroup.id,
                name: player.skillGroup.profile.description,
                salary: Number(player.salary),
            },
            new: {
                id: skillGroup.id,
                name: skillGroup.profile.description,
                salary: Number(payload.salary),
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

        return "RANKDOWN PROCESSED";
    }
}
