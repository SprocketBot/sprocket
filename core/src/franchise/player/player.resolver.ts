import {UseGuards} from "@nestjs/common";
import {Args, Float, Int, Mutation, ResolveField, Resolver, Root} from "@nestjs/graphql";
import {
    EventsService,
    EventTopic,
    NotificationEndpoint,
    NotificationMessageType,
    NotificationService,
    NotificationType,
} from "@sprocketbot/common";

import {MLE_OrganizationTeam} from "$mledb";
import type {GameSkillGroup} from "$models";
import {Member, Player} from "$models";
import {
    GameSkillGroupRepository,
    OrganizationProfileRepository,
    PlayerRepository,
    UserAuthenticationAccountRepository,
} from "$repositories";

import type {GameSkillGroup} from "../../database";
import {Player, UserAuthenticationAccount, UserAuthenticationAccountType} from "../../database";
import {
    League,
    LeagueOrdinals,
    MLE_OrganizationTeam,
    MLE_Platform,
    ModePreference,
    Timezone,
} from "../../database/mledb";
import type {ManualEloChange, ManualSkillGroupChange} from "../../elo/elo-connector";
import {Member} from "../../database/models";
import {OrganizationProfileRepository} from "../../database/repositories";
import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import type {ManualSkillGroupChange} from "../../elo/elo-connector";
import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {MledbPlayerService} from "../../mledb";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {PopulateService} from "../../util/populate/populate.service";
import {FranchiseService} from "../franchise";
import {PlayerService} from "./player.service";

@Resolver(() => Player)
export class PlayerResolver {
    constructor(
        private readonly popService: PopulateService,
        private readonly playerService: PlayerService,
        private readonly franchiseService: FranchiseService,
        private readonly skillGroupRepository: GameSkillGroupRepository,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly eloConnectorService: EloConnectorService,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
        private readonly organizationProfileRepository: OrganizationProfileRepository,
        private readonly playerRepository: PlayerRepository,
        private readonly mlePlayerService: MledbPlayerService,
    ) {}

    private readonly logger = new Logger(PlayerResolver.name);

    @ResolveField()
    async skillGroup(@Root() player: Player): Promise<GameSkillGroup> {
        return this.popService.populateOneOrFail(Player, player, "skillGroup");
    }

    @ResolveField()
    async franchiseName(@Root() player: Partial<Player>): Promise<string> {
        if (player.franchiseName) return player.franchiseName;

        const member: Partial<Member> =
            player.member ?? (await this.popService.populateOneOrFail(Player, player as Player, "member"));
        const user: Partial<User> =
            member.user ?? (await this.popService.populateOneOrFail(Member, member as Member, "user"));
        const franchiseResult = await this.franchiseService.getPlayerFranchises(user.id!);

        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].name;
    }

    @ResolveField()
    async franchisePositions(@Root() player: Partial<Player>): Promise<string[]> {
        if (player.franchisePositions) return player.franchisePositions;

        if (!player.member) {
            player.member = await this.popService.populateOneOrFail(Player, player as Player, "member");
        }

        const franchiseResult = await this.franchiseService.getPlayerFranchises(player.member.userId);
        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].staffPositions.map(sp => sp.name);
    }

    @ResolveField()
    async member(@Root() player: Partial<Player>): Promise<Member> {
        return player.member ?? this.popService.populateOneOrFail(Player, player as Player, "member");
    }

    @Mutation(() => String)
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async changePlayerSkillGroup(
        @Args("playerId", {type: () => Int}) playerId: number,
        @Args("salary", {type: () => Float}) salary: number,
        @Args("skillGroupId", {type: () => Int}) skillGroupId: number,
        @Args("silent", {type: () => Boolean, nullable: true}) silent?: boolean,
    ): Promise<string> {
        const player = await this.playerRepository.get({
            where: {id: playerId},
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

        const skillGroup = await this.skillGroupRepository.getById(skillGroupId, {relations: {profile: true}});

        const discordAccount = await this.userAuthenticationAccountRepository.getDiscordAccountByUserId(
            player.member.user.id,
        );
        const orgProfile = await this.organizationProfileRepository.getByOrganizationId(player.member.organization.id);

        const inputData: ManualSkillGroupChange = {
            id: playerId,
            salary: salary,
            skillGroup: skillGroup.ordinal,
        };

        if (player.member.organization.profile.name === "Minor League Esports")
            await this.mlePlayerService.movePlayerToLeague(playerId, skillGroupId, salary);

        await this.playerService.updatePlayerStanding(playerId, salary, skillGroupId);
        await this.eloConnectorService.createJob(EloEndpoint.SGChange, inputData);

        if (!silent) {
            await this.eventsService.publish(EventTopic.PlayerSkillGroupChanged, {
                playerId: player.id,
                name: player.member.profile.name,
                organizationId: player.skillGroup.organizationId,
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
                    salary: salary,
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
                                    value: `${salary}`,
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
                                name: `${orgProfile.name}`,
                            },
                            fields: [
                                {
                                    name: "New League",
                                    value: `${skillGroup.profile.description}`,
                                },
                                {
                                    name: "New Salary",
                                    value: `${salary}`,
                                },
                            ],
                            footer: {
                                text: orgProfile.name,
                            },
                            timestamp: Date.now(),
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
            });
        }

        return "SUCCESS";
    }
}
