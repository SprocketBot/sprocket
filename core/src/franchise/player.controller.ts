import {Controller, Get, HttpException, Logger, Param} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {CoreOutput} from "@sprocketbot/common";
import {
    CoreEndpoint,
    CoreSchemas,
    EventsService,
    EventTopic,
    NotificationEndpoint,
    NotificationService,
} from "@sprocketbot/common";

import type {ManualSkillGroupChange} from "../elo/elo-connector";
import {EloConnectorService, EloEndpoint} from "../elo/elo-connector";
import {UserAuthenticationAccountRepository} from "../identity/database/user-authentication-account.repository";
import {MledbPlayerService} from "../mledb";
import {GameSkillGroupRepository} from "./database/game-skill-group.repository";
import {PlayerRepository} from "./database/player.repository";
import {PlayerService} from "./player.service";
import {RankdownJwtPayloadSchema} from "./schemas/RankdownJwt.schema";

@Controller("player")
export class PlayerController {
    private readonly logger = new Logger(PlayerController.name);

    constructor(
        private readonly eloConnectorService: EloConnectorService,
        private readonly jwtService: JwtService,
        private readonly playerService: PlayerService,
        private readonly skillGroupRepository: GameSkillGroupRepository,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly userAuthenitcationAccountRepository: UserAuthenticationAccountRepository,
        private readonly playerRepository: PlayerRepository,
        private readonly mlePlayerService: MledbPlayerService,
    ) {}

    @Get("accept-rankdown/:token")
    async acceptRankdown(@Param("token") token: string): Promise<string> {
        try {
            const payload = RankdownJwtPayloadSchema.parse(this.jwtService.verify(token));

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
            const skillGroup = await this.skillGroupRepository.findById(payload.skillGroupId, {
                relations: {profile: true},
            });
            const discordAccount = await this.userAuthenitcationAccountRepository.getDiscordAccountByUserId(
                player.member.user.id,
            );

            if (player.skillGroup.id === payload.skillGroupId) throw new Error("You are already in this skill group");

            const inputData: ManualSkillGroupChange = {
                id: payload.playerId,
                salary: payload.salary,
                skillGroup: skillGroup.ordinal,
            };

            await this.playerService.updatePlayerStanding(payload.playerId, payload.salary, payload.skillGroupId);

            if (player.member.organization.profile.name === "Minor League Esports")
                await this.mlePlayerService.movePlayerToLeague(payload.playerId, payload.skillGroupId, payload.salary);

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

            await this.notificationService.send(
                NotificationEndpoint.SendNotification,
                this.playerService.buildRankdownNotification(
                    player.member.user.id,
                    discordAccount.accountId,
                    player.member.organization.id,
                    player.member.organization.profile.name,
                    player.skillGroup.profile.description,
                    skillGroup.profile.description,
                    payload.salary,
                ),
            );

            return "Successfully accepted rankdown";
        } catch (e) {
            this.logger.error(e);

            if (e instanceof Error) {
                if (e.name === "TokenExpiredError") throw new HttpException("Rankdown request expired", 400);
                throw new HttpException(e.message, 400);
            } else if (e instanceof String) {
                throw new HttpException(e, 400);
            } else {
                throw new HttpException("Unexpected error", 400);
            }
        }
    }

    @MessagePattern(CoreEndpoint.GetPlayerByPlatformId)
    async getPlayerByPlatformId(@Payload() payload: unknown): Promise<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>> {
        const data = CoreSchemas[CoreEndpoint.GetPlayerByPlatformId].input.parse(payload);
        return this.playerService.getPlayerByGameAndPlatformPayload(data);
    }

    @MessagePattern(CoreEndpoint.GetPlayersByPlatformIds)
    async getPlayersByPlatformIds(
        @Payload() payload: unknown,
    ): Promise<CoreOutput<CoreEndpoint.GetPlayersByPlatformIds>> {
        const data = CoreSchemas[CoreEndpoint.GetPlayersByPlatformIds].input.parse(payload);

        const allResults = await Promise.allSettled(
            data.map(async p => this.playerService.getPlayerByGameAndPlatformPayload(p)),
        );

        if (allResults.every(r => r.status === "fulfilled")) {
            return allResults.map(
                r => (r as PromiseFulfilledResult<CoreOutput<CoreEndpoint.GetPlayerByPlatformId>>).value,
            );
        }

        throw new Error(
            `Failed to fetch players by platform accounts: ${allResults
                .filter(r => r.status === "rejected")
                .map(failed => {
                    const result = failed as PromiseRejectedResult;
                    return (result.reason as Error).message;
                })
                .join(", ")}`,
        );
    }
}
