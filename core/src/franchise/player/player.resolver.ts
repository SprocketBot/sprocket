import {
    forwardRef, Inject, Logger, UseGuards,
} from "@nestjs/common";
import {
    Args,
    Field,
    Float,
    InputType,
    Int,
    Mutation,
    ResolveField,
    Resolver,
    Root,
} from "@nestjs/graphql";
import {InjectRepository} from "@nestjs/typeorm";
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
import {Repository} from "typeorm";

import {League, LeagueOrdinals, MLE_OrganizationTeam, MLE_Platform, ModePreference, Timezone} from "$mledb";
import type {GameSkillGroup} from "$models";
import {Member, Player} from "$models";
import {GameSkillGroupRepository, OrganizationProfileRepository} from "$repositories";

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
import {EloConnectorService, EloEndpoint} from "../../elo/elo-connector";
import {GqlJwtGuard} from "../../identity/auth/gql-auth-guard";
import {MLEOrganizationTeamGuard} from "../../mledb/mledb-player/mle-organization-team.guard";
import {PopulateService} from "../../util/populate/populate.service";
import {FranchiseService} from "../franchise";
import {PlayerService} from "./player.service";
import {EloRedistributionSchema, IntakeSchema} from "./player.types";

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
        @InjectRepository(UserAuthenticationAccount)
        private userAuthRepository: Repository<UserAuthenticationAccount>,
        private readonly organizationProfileRepository: OrganizationProfileRepository,
    ) {}

    private readonly logger = new Logger(PlayerResolver.name);

    @ResolveField()
    async skillGroup(@Root() player: Player): Promise<GameSkillGroup> {
        return this.popService.populateOneOrFail(Player, player, "skillGroup");
    }

    @ResolveField()
    async franchiseName(@Root() player: Player): Promise<string> {
        if (player.franchiseName) return player.franchiseName;

        if (!player.member) player.member = await this.popService.populateOneOrFail(Player, player, "member");
        if (!player.member.user)
            player.member.user = await this.popService.populateOneOrFail(Member, player.member, "user");

        const franchiseResult = await this.franchiseService.getPlayerFranchises(player.member.user.id);
        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].name;
    }

    @ResolveField()
    async franchisePositions(@Root() player: Player): Promise<string[]> {
        if (player.franchisePositions) return player.franchisePositions;

        if (!player.member) {
            player.member = await this.popService.populateOneOrFail(Player, player, "member");
        }

        const franchiseResult = await this.franchiseService.getPlayerFranchises(player.member.userId);
        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].staffPositions.map(sp => sp.name);
    }

    @ResolveField()
    async member(@Root() player: Player): Promise<Member> {
        if (player.member) return player.member;

        return this.popService.populateOneOrFail(Player, player, "member");
    }

    @Mutation(() => String)
    @UseGuards(
        GqlJwtGuard,
        MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]),
    )
    async changePlayerSkillGroup(
        @Args("playerId", {type: () => Int}) playerId: number,
        @Args("salary", {type: () => Float}) salary: number,
        @Args("skillGroupId", {type: () => Int}) skillGroupId: number,
        @Args("silent", {type: () => Boolean, nullable: true}) silent?: boolean,
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

        const discordAccount = await this.userAuthRepository.findOneOrFail({
            where: {
                user: {
                    id: player.member.user.id,
                },
                accountType: UserAuthenticationAccountType.DISCORD,
            },
        });
        const orgProfile = await this.organizationProfileRepository.getByOrganizationId(player.member.organization.id);

        const inputData: ManualSkillGroupChange = {
            id: playerId,
            salary: salary,
            skillGroup: skillGroup.ordinal,
        };

        await this.playerService.mle_movePlayerToLeague(playerId, salary, skillGroupId);
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

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerElo(
        @Args("playerId", {type: () => Int}) playerId: number,
        @Args("salary", {type: () => Float}) salary: number,
        @Args("elo", {type: () => Float}) elo: number,
    ): Promise<string> {
        const player = await this.playerService.getPlayer({
            where: {id: playerId},
        });

        const inputData: ManualEloChange = {
            id: playerId,
            salary: salary,
            elo: elo,
        };

        await this.playerService.mle_movePlayerToLeague(playerId, salary, player.skillGroupId);
        await this.playerService.updatePlayerStanding(playerId, salary, player.skillGroupId);
        await this.eloConnectorService.createJob(EloEndpoint.EloChange, inputData);

        this.logger.verbose(`Successfully changed ${playerId}'s salary to ${salary} and elo to ${elo}.`);
        return "SUCCESS";
    }
    
    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerEloBulk(@Args("files", {type: () => [GraphQLUpload]}) files: Array<Promise<FileUpload>>): Promise<string> {
        const csvs = await Promise.all(files.map(async f => f.then(async _f => readToString(_f.createReadStream()))));

        const results = csvs.flatMap(csv => csv.split(/(?:\r)?\n/g).map(l => l.trim().split(","))).filter(r => r.length > 1);
        const parsed = EloRedistributionSchema.parse(results);
        
        let numFailed = 0;
        let idsFailed: number[] = [];
        
        for (const player of parsed) {
            try {
                await this.changePlayerElo(player.playerId, player.salary, player.newElo);
            } catch {
                idsFailed.push(player.playerId);
                numFailed++;
                continue;
            }
        }
        
        return (numFailed === 0) ? `Success, all elos changed.` : `${numFailed} elos were unable to be changed. Player IDs who could not be adjusted: ${JSON.stringify(idsFailed)}`;
    }

    @Mutation(() => Player)
    @UseGuards(
        GqlJwtGuard,
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
        GqlJwtGuard,
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

        for (const player of parsed) {
            const sg = await this.skillGroupService.getGameSkillGroup({where: {ordinal: LeagueOrdinals.indexOf(player.skillGroup) + 1} });
            const accs = player.accounts.map(acc => {
                const match = acc.match(/rocket-league\/profile\/(\w+)\/([\w _.\-%[\]]+)/);
                if (!match) throw new Error("Failed to match tracker");
    
                return {
                    platform: platformTransform[match[1]] as MLE_Platform,
                    platformId: match[2],
                    tracker: acc,
                };
            });

            try {
                imported.push(await this.playerService.intakePlayer(
                    player.mleid,
                    player.discordId,
                    player.name,
                    sg.id,
                    player.salary,
                    player.preferredPlatform,
                    accs,
                    player.timezone,
                    player.preferredMode,
                ));
            } catch {
                continue;
            }
        }

        return imported;
    }
}
