import {UseGuards} from "@nestjs/common";
import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import type {ScrimSettings} from "@sprocketbot/common";
import {OrganizationConfigurationKeyCode, ScrimMode} from "@sprocketbot/common";
import {minutesToMilliseconds} from "date-fns";
import {GraphQLError} from "graphql";

import {AuthenticatedUser} from "../../authentication/decorators";
import {JwtAuthPayload} from "../../authentication/types";
import {CurrentMember, CurrentPlayer} from "../../authorization/decorators";
import {MemberGuard} from "../../authorization/guards";
import {QueueBanGuard} from "../../authorization/guards/member-restriction.guard";
import {OrganizationConfigurationService} from "../../configuration/organization-configuration/organization-configuration.service";
import {Player} from "../../franchise/database/player.entity";
import {PlayerRepository} from "../../franchise/database/player.repository";
import {GameModeRepository} from "../../game/database/game-mode.repository";
import {FormerPlayerScrimGuard} from "../../mledb/mledb-player/mledb-player.guard";
import {Member} from "../../organization/database/member.entity";
import {PopulateService} from "../../util";
import {CreateScrimInput} from "../graphql/create-scrim.input";
import {JoinScrimInput} from "../graphql/join-scrim.input";
import {ScrimObject} from "../graphql/scrim.object";
import {CreateScrimPlayerGuard, JoinScrimPlayerGuard} from "./scrim.guard";
import {ScrimService} from "./scrim.service";
import {ScrimToggleService} from "./scrim-toggle/scrim-toggle.service";

@Resolver()
export class ScrimPlayerResolver {
    constructor(
        private readonly scrimService: ScrimService,
        private readonly populateService: PopulateService,
        private readonly scrimToggleService: ScrimToggleService,
        private readonly gameModeRepository: GameModeRepository,
        private readonly playerRepository: PlayerRepository,
        private readonly organizationConfigurationService: OrganizationConfigurationService,
    ) {}

    @Query(() => [ScrimObject])
    // TODO: Get rid of the FormerPlayerScrimGuard after we get member status
    @UseGuards(FormerPlayerScrimGuard, MemberGuard)
    async getAvailableScrims(@CurrentMember() member: Member): Promise<ScrimObject[]> {
        const players = await this.populateService.populateMany(Member, member, "players");
        const scrims = await this.scrimService.getAllScrims(
            member.organizationId,
            players.map(p => p.skillGroupId),
        );

        return scrims as ScrimObject[];
    }

    @Query(() => ScrimObject, {nullable: true})
    async getCurrentScrim(@AuthenticatedUser() user: JwtAuthPayload): Promise<ScrimObject | null> {
        return this.scrimService.getScrimByPlayer(user.userId) as Promise<ScrimObject | null>;
    }

    @Mutation(() => ScrimObject)
    @UseGuards(QueueBanGuard, CreateScrimPlayerGuard, FormerPlayerScrimGuard)
    async createScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
        @CurrentMember() member: Member,
        @CurrentPlayer() player: Player,
        @Args("data", {type: () => CreateScrimInput}) data: CreateScrimInput,
    ): Promise<ScrimObject> {
        if (!user.currentOrganizationId) throw new GraphQLError("User is not connected to an organization");
        if (await this.scrimToggleService.scrimsAreDisabled()) throw new GraphQLError("Scrims are disabled");

        const gameMode = await this.gameModeRepository.findById(data.gameModeId);

        const checkinTimeout = await this.organizationConfigurationService.getOrganizationConfigurationValue<number>(
            user.currentOrganizationId,
            OrganizationConfigurationKeyCode.SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES,
        );

        const settings: ScrimSettings = {
            teamSize: gameMode.teamSize,
            teamCount: gameMode.teamCount,
            mode: data.settings.mode,
            competitive: data.settings.competitive,
            observable: data.settings.observable,
            checkinTimeout: minutesToMilliseconds(checkinTimeout),
        };

        return this.scrimService.createScrim({
            authorUserId: user.userId,
            organizationId: user.currentOrganizationId,
            gameModeId: gameMode.id,
            skillGroupId: player.skillGroupId,
            settings: settings,
            join: {
                userId: user.userId,
                playerName: member.profile.name,
                leaveAfter: data.leaveAfter,
                createGroup: data.createGroup,
                canSaveDemos: data.canSaveDemos ?? false,
            },
        }) as Promise<ScrimObject>;
    }

    @Mutation(() => Boolean)
    @UseGuards(QueueBanGuard, JoinScrimPlayerGuard, FormerPlayerScrimGuard)
    async joinScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
        @CurrentMember() member: Member,
        @CurrentPlayer() player: Player,
        @Args("data", {type: () => JoinScrimInput}) data: JoinScrimInput,
    ): Promise<boolean> {
        if (data.groupKey && data.createGroup) {
            throw new GraphQLError(
                "You cannot join a group and create a group. Please provide either group or createGroup, not both.",
            );
        }
        const group = data.groupKey ?? data.createGroup ?? undefined;

        const scrim = await this.scrimService.getScrimById(data.scrimId).catch(() => null);
        if (!scrim) throw new GraphQLError("Scrim does not exist");

        if (group && scrim.settings.mode === ScrimMode.ROUND_ROBIN) {
            throw new GraphQLError("You cannot create or join a group for a Round Robin scrim");
        }

        if (scrim.settings.competitive && player.skillGroupId !== scrim.skillGroupId)
            throw new GraphQLError("Player is not in the correct skill group");

        try {
            return await this.scrimService.joinScrim({
                scrimId: data.scrimId,
                userId: user.userId,
                playerName: member.profile.name,
                leaveAfter: data.leaveAfter,
                createGroup: data.createGroup,
                joinGroup: data.groupKey,
                canSaveDemos: data.canSaveDemos ?? false,
            });
        } catch (e) {
            throw new GraphQLError((e as Error).message);
        }
    }

    @Mutation(() => Boolean)
    async leaveScrim(@AuthenticatedUser() user: JwtAuthPayload): Promise<boolean> {
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) throw new GraphQLError("You must be in a scrim to leave");

        return this.scrimService.leaveScrim(user.userId, scrim.id);
    }

    @Mutation(() => Boolean)
    async checkInToScrim(@AuthenticatedUser() user: JwtAuthPayload): Promise<boolean> {
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) throw new GraphQLError("You must be in a scrim to check in");

        const player = scrim.players.find(p => p.userId === user.userId);
        if (!player) throw new GraphQLError("You must be in a scrim to checkin");

        return this.scrimService.checkIn(player.userId, scrim.id);
    }
}
