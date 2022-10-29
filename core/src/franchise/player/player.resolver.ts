import {UseGuards} from "@nestjs/common";
import {Args, Field, Float, InputType, Int, Mutation, ResolveField, Resolver, Root} from "@nestjs/graphql";
import {
    EventsService,
    EventTopic,
    NotificationEndpoint,
    NotificationMessageType,
    NotificationService,
    NotificationType,
    readToString,
} from "@sprocketbot/common";
import type {FileUpload} from "graphql-upload";
import {GraphQLUpload} from "graphql-upload";

import {League, LeagueOrdinals, MLE_OrganizationTeam, MLE_Platform, ModePreference, Timezone} from "$mledb";
import type {GameSkillGroup, User} from "$models";
import {Member, Player} from "$models";
import {
    GameSkillGroupRepository,
    OrganizationProfileRepository,
    UserAuthenticationAccountRepository,
} from "$repositories";

import {GraphQLJwtAuthGuard} from "../../authentication/guards";
import type {ManualSkillGroupChange} from "../../elo/elo-connector";
import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {PopulateService} from "../../util/populate/populate.service";
import {FranchiseService} from "../franchise";
import {PlayerService} from "./player.service";
import {IntakeSchema} from "./player.types";

const platformTransform = {
    epic: MLE_Platform.EPIC,
    steam: MLE_Platform.STEAM,
    psn: MLE_Platform.PS4,
    xbl: MLE_Platform.XBOX,
};

@InputType()
export class IntakePlayerAccount {
    @Field(() => MLE_Platform)
    platform: MLE_Platform;

    @Field(() => String)
    platformId: string;

    @Field(() => String)
    tracker: string;
}

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
    ) {}

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
    ): Promise<string> {
        const player = await this.playerService.getPlayer({
            where: {id: playerId},
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

        const skillGroup = await this.skillGroupRepository.getById(skillGroupId, {relations: {profile: true}});

        const discordAccount = await this.userAuthenticationAccountRepository.getDiscordAccountByUserId(
            player.member.user.id,
        );
        const orgProfile = await this.organizationProfileRepository.getByOrganizationId(player.member.organization.id);

        if (player.skillGroup.id === skillGroupId) return "ERROR: This player is already in this skill group";

        const inputData: ManualSkillGroupChange = {
            id: playerId,
            salary: salary,
            skillGroup: skillGroup.ordinal,
        };

        await this.playerService.mle_movePlayerToLeague(playerId, salary, skillGroupId);
        await this.playerService.updatePlayerStanding(playerId, salary, skillGroupId);
        await this.eloConnectorService.createJob(EloEndpoint.SGChange, inputData);

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
                    embeds: [
                        {
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

        return "SUCCESS";
    }

    @Mutation(() => Player)
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async intakePlayer(
        @Args("mleid") mleid: number,
        @Args("discordId") discordId: string,
        @Args("name") name: string,
        @Args("skillGroup", {type: () => League}) league: League,
        @Args("salary", {type: () => Float}) salary: number,
        @Args("preferredPlatform") platform: string,
        @Args("timezone", {type: () => Timezone}) timezone: Timezone,
        @Args("preferredMode", {type: () => ModePreference})
        mode: ModePreference,
        @Args("accounts", {type: () => [IntakePlayerAccount]})
        accounts: IntakePlayerAccount[],
    ): Promise<Player> {
        const sg = await this.skillGroupRepository.get({
            where: {ordinal: LeagueOrdinals.indexOf(league) + 1},
        });
        return this.playerService.intakePlayer(
            mleid,
            name,
            discordId,
            sg.id,
            salary,
            platform,
            accounts,
            timezone,
            mode,
        );
    }

    @Mutation(() => [Player])
    @UseGuards(
        GraphQLJwtAuthGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async intakePlayerBulk(
        @Args("files", {type: () => [GraphQLUpload]})
        files: Array<Promise<FileUpload>>,
    ): Promise<Player[]> {
        const csvs = await Promise.all(files.map(async f => f.then(async _f => readToString(_f.createReadStream()))));

        const results = csvs
            .flatMap(csv => csv.split(/(?:\r)?\n/g).map(l => l.trim().split(",")))
            .filter(r => r.length > 1);
        const parsed = IntakeSchema.parse(results);

        const imported = await Promise.allSettled(
            parsed.map(async player => {
                const sg = await this.skillGroupRepository.get({
                    where: {ordinal: LeagueOrdinals.indexOf(player.skillGroup) + 1},
                });
                const accs = player.accounts.map(acc => {
                    const match = acc.match(/rocket-league\/profile\/(\w+)\/([\w _.\-%[\]]+)/);
                    if (!match) throw new Error("Failed to match tracker");

                    return {
                        platform: platformTransform[match[1]] as MLE_Platform,
                        platformId: match[2],
                        tracker: acc,
                    };
                });
                return this.playerService.intakePlayer(
                    player.mleid,
                    player.discordId,
                    player.name,
                    sg.id,
                    player.salary,
                    player.preferredPlatform,
                    accs,
                    player.timezone,
                    player.preferredMode,
                );
            }),
        );

        // @ts-expect-error Trust that this will work.
        return imported.filter(i => i.status === "fulfilled").map(i => i.value as Player);
    }
}
