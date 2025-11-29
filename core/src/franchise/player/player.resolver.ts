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

import type { GameSkillGroup } from "../../database/franchise/game_skill_group/game_skill_group.model";
import { Player } from "../../database/franchise/player/player.model";
import { User } from "../../database/identity/user/user.model";
import { UserAuthenticationAccount } from "../../database/identity/user_authentication_account/user_authentication_account.model";
import { UserAuthenticationAccountType } from "../../database/identity/user_authentication_account/user_authentication_account_type.enum";
import { Member } from "../../database/organization/member/member.model";
import {
    League, LeagueOrdinals, MLE_OrganizationTeam, MLE_Platform, ModePreference, Timezone,
} from "../../database/mledb";
import type { ManualSkillGroupChange } from "../../elo/elo-connector";
import { EloConnectorService, EloEndpoint } from "../../elo/elo-connector";
import { CreatePlayerTuple } from "../../franchise/player/player.types";
import { GqlJwtGuard } from "../../identity/auth/gql-auth-guard";
import { MLEOrganizationTeamGuard } from "../../mledb/mledb-player/mle-organization-team.guard";
import { OrganizationService } from "../../organization";
import { PopulateService } from "../../util/populate/populate.service";
import { FranchiseService } from "../franchise";
import { GameSkillGroupService } from "../game-skill-group";
import { PlayerService } from "./player.service";
import {
    changeSkillGroupSchema,
    IntakeSchema,
    IntakeUserBulkSchema,
    OperationError,
    ChangePlayerSkillGroupResult,
    IntakeUserResult,
    SwapDiscordAccountsResult,
    ForcePlayerToTeamResult,
    ChangePlayerNameResult
} from "./player.types";

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

    @Mutation(() => ChangePlayerSkillGroupResult)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerSkillGroupBulk(
        @Args("files", { type: () => [GraphQLUpload] })
        files: Array<Promise<FileUpload>>
    ): Promise<typeof ChangePlayerSkillGroupResult> {
        try {
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

            return new OperationError('Bulk skill group change completed successfully', 200);
        } catch (error) {
            this.logger.error(`Error in bulk skill group change: ${error}`);
            return new OperationError(
                error instanceof Error ? error.message : 'Failed to process bulk skill group change',
                500
            );
        }
    }

    @Mutation(() => ChangePlayerSkillGroupResult)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerSkillGroup(
        @Args("playerId", { type: () => Int }) playerId: number,
        @Args("salary", { type: () => Float }) salary: number,
        @Args("skillGroupId", { type: () => Int }) skillGroupId: number,
        @Args("silent", { type: () => Boolean, nullable: true }) silent?: boolean,
    ): Promise<typeof ChangePlayerSkillGroupResult> {
        try {
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

            // Return the updated player on success
            return this.playerService.getPlayer({
                where: { id: playerId },
                relations: {
                    member: {
                        user: true,
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
        } catch (error) {
            this.logger.error(`Error changing player skill group: ${error}`);
            return new OperationError(
                error instanceof Error ? error.message : 'Failed to change player skill group',
                500
            );
        }
    }

    @Mutation(() => Player)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async createPlayer(
        @Args("memberId", { type: () => Int }) memberId: number,
        @Args("skillGroupId", { type: () => Int }) skillGroupId: number,
        @Args("salary", { type: () => Float }) salary: number,
    ): Promise<Player> {
        return this.playerService.createPlayer(memberId, skillGroupId, salary);
    }

    @Mutation(() => [String])
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async intakeUserBulk(@Args("files", { type: () => [GraphQLUpload] }) files: Array<Promise<FileUpload>>): Promise<string[]> {
        const csvs = await Promise.all(files
            .map(
                async f => f.then(
                    async _f => readToString(_f.createReadStream())
                )
            )
        );

        this.logger.debug(`Parsing CSV data: ${csvs.join("\n")}`);

        const users: z.infer<typeof IntakeUserBulkSchema>[] = [];
        const errors: string[] = [];

        for (const csv of csvs) {
            this.logger.debug(`CSV Content: ${csv}`);
            const parsed = parseAndValidateCsv(
                csv,
                IntakeUserBulkSchema
            );
            if (parsed.errors.length > 0) {
                this.logger.error(`Errors encountered during CSV parsing: ${parsed.errors.length} errors found.`);
                for (const error of parsed.errors) {
                    this.logger.error(`Error in CSV: Row ${error.row}, Field: ${error.field || 'N/A'}, Value: ${error.value || 'N/A'}, Message: ${error.message}`);
                    errors.push(`Row ${error.row}, Field: ${error.field || 'N/A'}, Value: ${error.value || 'N/A'}, Message: ${error.message}`);
                }
            }
            users.push(...parsed.data);
        }

        for (const user of users) {
            try {
                this.logger.debug(`Intaking user ${user.discordId} ${user.name}`);
                const result = await this.playerService.intakeUser(
                    user.name,
                    user.discordId,
                    [{
                        gameSkillGroupId: user.skillGroupId,
                        salary: user.salary,
                    }]
                );
                if (typeof result === "string") {
                    errors.push(`Failed to intake user ${user.discordId} ${user.name}: ${result}`);
                }
            } catch (err: unknown) {
                this.logger
                    .error(
                        `Failed to intake user
                        ${user.discordId} ${user.name}:
                        ${JSON.stringify(err)}`);
                errors.push(`Failed to intake user ${user.discordId} ${user.name}: ${JSON.stringify(err)}`);
                continue;
            }
        }

        return errors;
    }

    @Mutation(() => IntakeUserResult)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async intakeUser(
        @Args("name", { type: () => String }) name: string,
        @Args("discord_id", { type: () => String }) d_id: string,
        @Args("playersToLink", { type: () => [CreatePlayerTuple] }) ptl: CreatePlayerTuple[],
    ): Promise<typeof IntakeUserResult> {
        try {
            const result = await this.playerService.intakeUser(name, d_id, ptl);

            // If the service returns a string, it's an error message
            if (typeof result === 'string') {
                return new OperationError(result, 400);
            }

            // If it returns a Player, return the player
            if (result instanceof Player) {
                return result;
            }

            // Fallback - return success message as OperationError
            return new OperationError('User intake completed successfully', 200);
        } catch (error) {
            this.logger.error(`Error in intakeUser: ${error}`);
            return new OperationError(
                error instanceof Error ? error.message : 'Failed to intake user',
                500
            );
        }
    }


    @Mutation(() => SwapDiscordAccountsResult)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async swapDiscordAccounts(
        @Args("newAcct", { type: () => String }) newAcct: string,
        @Args("oldAcct", { type: () => String }) oldAcct: string,
    ): Promise<typeof SwapDiscordAccountsResult> {
        try {
            await this.playerService.swapDiscordAccounts(newAcct, oldAcct);
            return new OperationError('Discord accounts swapped successfully', 200);
        } catch (error) {
            this.logger.error(`Error swapping Discord accounts: ${error}`);
            return new OperationError(
                error instanceof Error ? error.message : 'Failed to swap Discord accounts',
                500
            );
        }
    }

    @Mutation(() => ForcePlayerToTeamResult)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async forcePlayerToTeam(
        @Args("mleid", { type: () => Int }) mleid: number,
        @Args("newTeam", { type: () => String }) newTeam: string,
    ): Promise<typeof ForcePlayerToTeamResult> {
        try {
            await this.playerService.forcePlayerToTeam(mleid, newTeam);
            return new OperationError('Player forced to team successfully', 200);
        } catch (error) {
            this.logger.error(`Error forcing player to team: ${error}`);
            return new OperationError(
                error instanceof Error ? error.message : 'Failed to force player to team',
                500
            );
        }
    }

    @Mutation(() => ChangePlayerNameResult)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard([MLE_OrganizationTeam.MLEDB_ADMIN, MLE_OrganizationTeam.LEAGUE_OPERATIONS]))
    async changePlayerName(
        @Args("mleid", { type: () => Int }) mleid: number,
        @Args("newName", { type: () => String }) newName: string,
    ): Promise<typeof ChangePlayerNameResult> {
        try {
            await this.playerService.changePlayerName(mleid, newName);
            return new OperationError('Player name changed successfully', 200);
        } catch (error) {
            this.logger.error(`Error changing player name: ${error}`);
            return new OperationError(
                error instanceof Error ? error.message : 'Failed to change player name',
                500
            );
        }
    }
}
