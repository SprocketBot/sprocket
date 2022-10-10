import {
    Controller, forwardRef, Get, HttpException, Inject, Logger, Param,
} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@nestjs/typeorm";
import {
    EventsService, EventTopic, NotificationEndpoint, NotificationService,
} from "@sprocketbot/common";
import {Repository} from "typeorm";

import {UserAuthenticationAccount, UserAuthenticationAccountType} from "../../database";
import type {ManualSkillGroupChange} from "../../elo/elo-connector";
import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {OrganizationService} from "../../organization";
import {GameSkillGroupService} from "../game-skill-group";
import {PlayerService} from "./player.service";
import {RankdownJwtPayloadSchema} from "./player.types";

@Controller("player")
export class PlayerController {
    private readonly logger = new Logger(PlayerController.name);

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
        try {
            const payload = await RankdownJwtPayloadSchema
                .parseAsync(this.jwtService.verify(token))
                .catch(() => {
                    throw new Error("Failed to verify payload - request expired");
                });

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

            if (player.skillGroup.id === payload.skillGroupId) throw new Error("You are already in this skill group");

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

            await this.notificationService.send(NotificationEndpoint.SendNotification, this.playerService.buildRankdownNotification(
                player.member.user.id,
                discordAccount.accountId,
                player.member.organization.id,
                orgProfile.name,
                player.skillGroup.profile.description,
                skillGroup.profile.description,
                payload.salary,
            ));

            return "Successfully accepted rankdown";
        } catch (e) {
            this.logger.error(e);
            if (e instanceof Error) {
                throw new HttpException(e.message, 400);
            } else if (e instanceof String) {
                throw new HttpException(e, 400);
            } else {
                throw new HttpException("Unexpected error", 400);
            }
            
        }
    }
}
