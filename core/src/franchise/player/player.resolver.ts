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
import { InjectRepository } from "@nestjs/typeorm";
import {
    EventsService,
    EventTopic,
    NotificationEndpoint,
    NotificationMessageType,
    NotificationService,
    NotificationType,
    readToString,
} from "@sprocketbot/common";
import type { FileUpload } from "graphql-upload";
import { GraphQLUpload } from "graphql-upload";
import { Repository } from "typeorm";
import { z } from "zod"; import { parseAndValidateCsv } from "../../util/csv-parse";

import type { GameSkillGroup } from "../../database";
import {
    Member, Player, User, UserAuthenticationAccount, UserAuthenticationAccountType,
} from "../../database";
import {
    League, LeagueOrdinals, MLE_OrganizationTeam, MLE_Platform, ModePreference, Timezone,
} from "../../database/mledb";
import type { ManualEloChange, ManualSkillGroupChange } from "../../elo/elo-connector";
import { EloConnectorService, EloEndpoint } from "../../elo/elo-connector";
import { CreatePlayerTuple } from "../../franchise/player/player.types";
import { GqlJwtGuard } from "../../identity/auth/gql-auth-guard";
import { MLEOrganizationTeamGuard } from "../../mledb/mledb-player/mle-organization-team.guard";
import { OrganizationService } from "../../organization";
import { PopulateService } from "../../util/populate/populate.service";
import { FranchiseService } from "../franchise";
import { GameSkillGroupService } from "../game-skill-group";
import { PlayerService } from "./player.service";
import { EloRedistributionSchema, IntakeSchema } from "./player.types";

const platformTransform = {
    "epic": MLE_Platform.EPIC,
    "steam": MLE_Platform.STEAM,
    "psn": MLE_Platform.PS4,
    "xbl": MLE_Platform.XBOX,
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

const changeSkillGroupSchema = z.object({
    playerId: z.preprocess(
        (val) => Number(val),
        z.number().int().positive()
    ),

    // Note: Salary might need to handle decimals, so we don't use .int()
    salary: z.preprocess(
        (val) => Number(val),
        z.number().positive()
    ),

    skillGroupId: z.preprocess(
        (val) => Number(val),
        z.number().int().positive()
    ),
});

@Resolver(() => Player)
export class PlayerResolver {

    private readonly logger = new Logger(PlayerResolver.name);

    constructor(
        private readonly popService: PopulateService,
        private readonly playerService: PlayerService,
        private readonly franchiseService: FranchiseService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly eventsService: EventsService,
        private readonly notificationService: NotificationService,
        private readonly eloConnectorService: EloConnectorService,
        @InjectRepository(UserAuthenticationAccount) private userAuthRepository: Repository<UserAuthenticationAccount>,
        @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
    ) { }

    @ResolveField()
    async skillGroup(@Root() player: Player): Promise<GameSkillGroup> {
        return this.popService.populateOneOrFail(Player, player, "skillGroup");
    }

    @ResolveField()
    async franchiseName(@Root() player: Player): Promise<string> {
        if (player.franchiseName) return player.franchiseName;

        if (!player.member) player.member = await this.popService.populateOneOrFail(Player, player, "member");
        if (!player.member.user) player.member.user = await this.popService.populateOneOrFail(Member, player.member, "user");

        const franchiseResult = await this.franchiseService.getPlayerFranchisesByMemberId(player.member.id);
        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].name;
    }

    @ResolveField()
    async franchisePositions(@Root() player: Player): Promise<string[]> {
        if (player.franchisePositions) return player.franchisePositions;

        if (!player.member) {
            player.member = await this.popService.populateOneOrFail(Player, player, "member");
        }

        const franchiseResult = await this.franchiseService.getPlayerFranchisesByMemberId(player.member.id);
        // Because we are using MLEDB right now; assume that we only have one
        return franchiseResult[0].staffPositions.map(sp => sp.name);
    }

    @ResolveField()
    async member(@Root() player: Player): Promise<Member> {
        if (player.member) return player.member;

        return this.popService.populateOneOrFail(Player, player, "member");
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerSkillGroupBulk(
        @Args("files", { type: () => [GraphQLUpload] })
        files: Array<Promise<FileUpload>>
    ): Promise<string> {

        this.logger.debug("Starting bulk skill group change");
        const csvs = await Promise.all(
            files.map(async f => f.then(
                async _f => readToString(
                    _f.createReadStream()
                ))));

        this.logger.debug("Parsing and validating CSV files");
        const results = await Promise.all(csvs.map(async csv => {
            this.logger.debug(`Parsing and validating a CSV file: ${csv.substring(0, 50)}...`);
            const records = parseAndValidateCsv(
                csv,
                changeSkillGroupSchema
            );
            this.logger.debug(`Processing ${records.data.length} records from CSV`);
            this.logger.debug(`Found ${records.errors.length} errors in CSV`);
            for (const error of records.errors) {
                this.logger.error(`Error in CSV: Row ${error.row}, Field: ${error.field || 'N/A'}, Value: ${error.value || 'N/A'}, Message: ${error.message}`);
            }
            this.logger.debug(`Processing ${records.data.length} valid records from CSV`);
            for (const record of records.data) {
                try {
                    this.logger.debug(`Processing player ID ${record.playerId}`);
                    await this.changePlayerSkillGroup(
                        record.playerId,
                        record.salary,
                        record.skillGroupId,
                        false
                    );
                    this.logger.debug(`Successfully processed player ID ${record.playerId}`);
                } catch (error) {
                    this.logger.error(`Error processing player ID ${record.playerId}:`, error);
                }
            }
        }));

        return results.join("\n");
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerSkillGroup(
        @Args("playerId", { type: () => Int }) playerId: number,
        @Args("salary", { type: () => Float }) salary: number,
        @Args("skillGroupId", { type: () => Int }) skillGroupId: number,
        @Args("silent", { type: () => Boolean, nullable: true }) silent?: boolean,
    ): Promise<string> {
        this.logger.debug(`Changing skill group for player ID ${playerId} to skill group ID ${skillGroupId} with salary ${salary}`);
        const player = await this.playerService.getPlayer({
            where: { id: playerId },
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

        this.logger.debug(`Player found: ${player.member.profile.name}`);
        const skillGroup = await this.skillGroupService.getGameSkillGroup({
            where: {
                id: skillGroupId,
            },
            relations: {
                profile: true,
            },
        });
        this.logger.debug(`Target skill group found: ${skillGroup.profile.description}`);

        const discordAccount = await this.userAuthRepository.findOneOrFail({
            where: {
                user: {
                    id: player.member.user.id,
                },
                accountType: UserAuthenticationAccountType.DISCORD,
            },
        });
        this.logger.debug(`Discord account found: ${discordAccount.accountId}`);
        const orgProfile = await this.organizationService.getOrganizationProfileForOrganization(player.member.organization.id);
        this.logger.debug(`Organization profile found: ${orgProfile.name}`);
        const inputData: ManualSkillGroupChange = {
            id: playerId,
            salary: salary,
            skillGroup: skillGroup.ordinal,
        };

        await this.playerService.mle_movePlayerToLeague(playerId, salary, skillGroupId);
        this.logger.debug(`Moved player ID ${playerId} to league with skill group ID ${skillGroupId} and salary ${salary}`);
        await this.playerService.updatePlayerStanding(playerId, salary, skillGroupId);
        this.logger.debug(`Updated player standing for player ID ${playerId}`);
        await this.eloConnectorService.createJob(EloEndpoint.SGChange, inputData);
        this.logger.debug(`Created Elo job for player ID ${playerId}`);

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
                        embeds: [{
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
                        }],
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

        return "SUCCESS";
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerElo(
        @Args("playerId", { type: () => Int }) playerId: number,
        @Args("salary", { type: () => Float }) salary: number,
        @Args("elo", { type: () => Float }) elo: number,
    ): Promise<string> {
        const player = await this.playerService.getPlayer({
            where: { id: playerId },
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
    async changePlayerEloBulk(@Args("files", { type: () => [GraphQLUpload] }) files: Array<Promise<FileUpload>>): Promise<string> {
        const csvs = await Promise.all(files.map(async f => f.then(async _f => readToString(_f.createReadStream()))));

        const results = csvs.flatMap(csv => csv.split(/(?:\r)?\n/g).map(l => l.trim().split(","))).filter(r => r.length > 1);
        const parsed = EloRedistributionSchema.parse(results);

        let numFailed = 0;
        const idsFailed: number[] = [];

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
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async intakePlayer(
        @Args("mleid") mleid: number,
        @Args("discordId") discordId: string,
        @Args("name") name: string,
        @Args("skillGroup", { type: () => League }) league: League,
        @Args("salary", { type: () => Float }) salary: number,
        @Args("preferredPlatform") platform: string,
        @Args("timezone", { type: () => Timezone }) timezone: Timezone,
        @Args("preferredMode", { type: () => ModePreference }) mode: ModePreference,
        @Args("accounts", { type: () => [IntakePlayerAccount], nullable: true }) accounts?: IntakePlayerAccount[],
    ): Promise<Player> {
        const sg = await this.skillGroupService.getGameSkillGroup({ where: { ordinal: LeagueOrdinals.indexOf(league) + 1 } });
        return this.playerService.intakePlayer(mleid, discordId, name, sg.id, salary, platform, timezone, mode);
    }

    @Mutation(() => [Player])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async intakePlayerBulk(@Args("files", { type: () => [GraphQLUpload] }) files: Array<Promise<FileUpload>>): Promise<Player[]> {
        const csvs = await Promise.all(files.map(async f => f.then(async _f => readToString(_f.createReadStream()))));

        const results = csvs.flatMap(csv => csv.split(/(?:\r)?\n/g).map(l => l.trim().split(","))).filter(r => r.length > 1);
        const parsed = IntakeSchema.parse(results);

        const imported: Player[] = [];

        for (const player of parsed) {
            const sg = await this.skillGroupService.getGameSkillGroup({ where: { ordinal: LeagueOrdinals.indexOf(player.skillGroup) + 1 } });

            try {
                imported.push(await this.playerService.intakePlayer(
                    player.mleid,
                    player.discordId,
                    player.name,
                    sg.id,
                    player.salary,
                    player.preferredPlatform,
                    player.timezone,
                    player.preferredMode,
                ));
            } catch {
                continue;
            }
        }

        return imported;
    }

    @Mutation(() => Player)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async updatePlayer(
        @Args("mleid") mleid: number,
        @Args("name") name: string,
        @Args("skillGroup", { type: () => League }) league: League,
        @Args("salary", { type: () => Float }) salary: number,
        @Args("preferredPlatform") platform: string,
        @Args("timezone", { type: () => Timezone }) timezone: Timezone,
        @Args("preferredMode", { type: () => ModePreference }) mode: ModePreference,
        @Args("accounts", { type: () => [IntakePlayerAccount], nullable: true }) accounts?: IntakePlayerAccount[],
    ): Promise<Player> {
        const sg = await this.skillGroupService.getGameSkillGroup({ where: { ordinal: LeagueOrdinals.indexOf(league) + 1 } });
        return this.playerService.updatePlayer(mleid, name, sg.id, salary, platform, timezone, mode);
    }

    @Mutation(() => [User])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async intakeUser(
        @Args("name", { type: () => String }) name: string,
        @Args("discord_id", { type: () => String }) d_id: string,
        @Args("playersToLink", { type: () => [CreatePlayerTuple] }) ptl: CreatePlayerTuple[],
        @Args("platformAccounts", { type: () => [IntakePlayerAccount], nullable: true }) platformAccounts: IntakePlayerAccount[] = [],
    ): Promise<User | string> {
        return this.playerService.intakeUser(name, d_id, ptl);
    }


    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async swapDiscordAccounts(
        @Args("newAcct", { type: () => String }) newAcct: string,
        @Args("oldAcct", { type: () => String }) oldAcct: string,
    ): Promise<string> {
        await this.playerService.swapDiscordAccounts(newAcct, oldAcct);
        return "Success."
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async forcePlayerToTeam(
        @Args("mleid", { type: () => Int }) mleid: number,
        @Args("newTeam", { type: () => String }) newTeam: string,
    ): Promise<string> {
        await this.playerService.forcePlayerToTeam(mleid, newTeam);
        return "Success."
    }

    @Mutation(() => String)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerName(
        @Args("mleid", { type: () => Int }) mleid: number,
        @Args("newName", { type: () => String }) newName: string,
    ): Promise<string> {
        await this.playerService.changePlayerName(mleid, newName);
        return "Success."
    }
}
