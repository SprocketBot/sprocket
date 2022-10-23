import {Inject, Logger, UseGuards} from "@nestjs/common";
import {Args, Int, Mutation, Query, Resolver, Subscription} from "@nestjs/graphql";
import type {ScrimSettings as IScrimSettings} from "@sprocketbot/common";
import {ScrimMode, ScrimStatus} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {minutesToMilliseconds} from "date-fns";
import {GraphQLError} from "graphql";

import {MLE_OrganizationTeam} from "$mledb";
import {Member, Player} from "$models";
import {GameModeRepository, PlayerRepository} from "$repositories";
import {OrganizationConfigurationKeyCode} from "$types";
import {PopulateService} from "$util";

import {AuthenticatedUser} from "../authentication/decorators";
import {GraphQLJwtAuthGuard} from "../authentication/guards";
import {JwtAuthPayload} from "../authentication/types";
import {CurrentPlayer} from "../authorization/decorators";
import {CurrentMember} from "../authorization/decorators/current-member.decorator";
import {MemberGuard} from "../authorization/guards";
import {OrganizationConfigurationService} from "../configuration";
import {PlayerService} from "../franchise";
import {MLEOrganizationTeamGuard} from "../mledb/mledb-player/mle-organization-team.guard";
import {FormerPlayerScrimGuard} from "../mledb/mledb-player/mledb-player.guard";
import {QueueBanGuard} from "../organization";
import {ScrimPubSub} from "./constants";
import {CreateScrimPlayerGuard, JoinScrimPlayerGuard} from "./scrim.guard";
import {ScrimService} from "./scrim.service";
import {ScrimToggleService} from "./scrim-toggle";
import {CreateScrimInput, Scrim, ScrimEvent} from "./types";
import {ScrimMetrics} from "./types/ScrimMetrics";

@Resolver()
export class ScrimModuleResolverPublic {
    constructor(@Inject(ScrimPubSub) private readonly pubSub: PubSub, private readonly scrimService: ScrimService) {}

    @Query(() => ScrimMetrics)
    async getScrimMetrics(): Promise<ScrimMetrics> {
        return this.scrimService.getScrimMetrics();
    }

    @Subscription(() => ScrimMetrics)
    async followScrimMetrics(): Promise<AsyncIterator<ScrimMetrics>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.metricsSubTopic);
    }
}

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class ScrimModuleResolver {
    private readonly logger = new Logger(ScrimModuleResolver.name);

    constructor(
        @Inject(ScrimPubSub) private readonly pubSub: PubSub,
        private readonly playerService: PlayerService,
        private readonly scrimService: ScrimService,
        private readonly gameModeRepository: GameModeRepository,
        private readonly organizationConfigurationService: OrganizationConfigurationService,
        private readonly scrimToggleService: ScrimToggleService,
        private readonly populateService: PopulateService,
        private readonly playerRepository: PlayerRepository,
    ) {}

    /*
     *
     * Queries
     *
     */

    @Query(() => [Scrim])
    @UseGuards(FormerPlayerScrimGuard, MemberGuard)
    async getAllScrims(
        @CurrentMember() member: Member,
        @Args("status", {
            type: () => ScrimStatus,
            nullable: true,
        })
        status?: ScrimStatus,
    ): Promise<Scrim[]> {
        const scrims = await this.scrimService.getAllScrims(undefined, member.organizationId);
        return (status ? scrims.filter(scrim => scrim.status === status) : scrims) as Scrim[];
    }

    @Query(() => [Scrim])
    @UseGuards(FormerPlayerScrimGuard, MemberGuard)
    async getAvailableScrims(@CurrentMember() member: Member): Promise<Scrim[]> {
        const players = await this.populateService.populateMany(Member, member, "players");
        const scrims = await this.scrimService.getAllScrims(undefined, member.organizationId);

        return scrims.filter(
            scrim => !scrim.settings.competitive || players.some(player => player.skillGroupId === scrim.skillGroupId),
        ) as Scrim[];
    }

    @Query(() => Scrim, {nullable: true})
    async getCurrentScrim(@AuthenticatedUser() user: JwtAuthPayload): Promise<Scrim | null> {
        return this.scrimService.getScrimByPlayer(user.userId) as Promise<Scrim | null>;
    }

    /*
     *
     * Mutations
     *
     */

    @Mutation(() => Scrim)
    @UseGuards(QueueBanGuard, CreateScrimPlayerGuard, FormerPlayerScrimGuard)
    async createScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
        @Args("data", {type: () => CreateScrimInput}) data: CreateScrimInput,
    ): Promise<Scrim> {
        if (!user.currentOrganizationId) throw new GraphQLError("User is not connected to an organization");
        if (await this.scrimToggleService.scrimsAreDisabled()) throw new GraphQLError("Scrims are disabled");

        const gameMode = await this.gameModeRepository.getById(data.gameModeId);
        const player = await this.playerRepository.getByOrganizationAndGame(
            user.userId,
            user.currentOrganizationId,
            gameMode.gameId,
        );

        const checkinTimeout = await this.organizationConfigurationService.getOrganizationConfigurationValue<number>(
            user.currentOrganizationId,
            OrganizationConfigurationKeyCode.SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES,
        );

        const settings: IScrimSettings = {
            teamSize: gameMode.teamSize,
            teamCount: gameMode.teamCount,
            mode: data.settings.mode,
            competitive: data.settings.competitive,
            observable: data.settings.observable,
            checkinTimeout: minutesToMilliseconds(checkinTimeout),
        };

        return this.scrimService.createScrim({
            authorId: user.userId,
            organizationId: user.currentOrganizationId,
            gameModeId: gameMode.id,
            skillGroupId: player.skillGroupId,
            settings: settings,
            join: {
                playerId: user.userId,
                playerName: user.username,
                leaveAfter: data.leaveAfter,
                createGroup: data.createGroup,
            },
        }) as Promise<Scrim>;
    }

    @Mutation(() => Boolean)
    @UseGuards(QueueBanGuard, JoinScrimPlayerGuard, FormerPlayerScrimGuard)
    async joinScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
        @CurrentPlayer() player: Player,
        @Args("scrimId") scrimId: string,
        @Args("leaveAfter", {type: () => Int}) leaveAfter: number,
        @Args("group", {nullable: true}) groupKey?: string,
        @Args("createGroup", {nullable: true}) createGroup?: boolean,
    ): Promise<boolean> {
        if (groupKey && createGroup) {
            throw new GraphQLError(
                "You cannot join a group and create a group. Please provide either group or createGroup, not both.",
            );
        }
        const group = groupKey ?? createGroup ?? undefined;

        const scrim = await this.scrimService.getScrimById(scrimId).catch(() => null);
        if (!scrim) throw new GraphQLError("Scrim does not exist");

        if (group && scrim.settings.mode === ScrimMode.ROUND_ROBIN) {
            throw new GraphQLError("You cannot create or join a group for a Round Robin scrim");
        }

        if (scrim.settings.competitive && player.skillGroupId !== scrim.skillGroupId)
            throw new GraphQLError("Player is not in the correct skill group");

        try {
            return await this.scrimService.joinScrim({
                scrimId: scrimId,
                playerId: user.userId,
                playerName: user.username,
                leaveAfter: leaveAfter,
                createGroup: createGroup,
                joinGroup: groupKey,
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

        const player = scrim.players.find(p => p.id === user.userId);
        if (!player) throw new GraphQLError("You must be in a scrim to checkin");

        return this.scrimService.checkIn(player.id, scrim.id);
    }

    @Mutation(() => Scrim)
    async cancelScrim(@Args("scrimId") scrimId: string): Promise<Scrim> {
        return this.scrimService.cancelScrim(scrimId) as Promise<Scrim>;
    }

    @Mutation(() => Boolean)
    @UseGuards(GraphQLJwtAuthGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async lockScrim(@Args("scrimId") scrimId: string): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, true);
    }

    @Mutation(() => Boolean)
    @UseGuards(GraphQLJwtAuthGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async unlockScrim(@Args("scrimId") scrimId: string): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, false);
    }

    /*
     *
     * Subscriptions
     *
     */

    @Subscription(() => ScrimEvent)
    async followCurrentScrim(
        @AuthenticatedUser() user: JwtAuthPayload,
    ): Promise<AsyncIterator<ScrimEvent> | undefined> {
        await this.scrimService.enableSubscription();
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) return undefined;
        return this.pubSub.asyncIterator(scrim.id);
    }

    @Subscription(() => Scrim, {
        async filter(
            this: ScrimModuleResolver,
            payload: {followPendingScrims: Scrim},
            variables,
            context: {req: {user: JwtAuthPayload}},
        ) {
            const {userId, currentOrganizationId} = context.req.user;
            if (!currentOrganizationId) return false;

            const {id: gameModeId} = payload.followPendingScrims.gameMode;
            const player = await this.playerService.getPlayerByOrganizationAndGameMode(
                userId,
                currentOrganizationId,
                gameModeId,
            );

            return (
                player.skillGroupId === payload.followPendingScrims.skillGroupId ||
                !payload.followPendingScrims.settings.competitive
            );
        },
    })
    async followPendingScrims(): Promise<AsyncIterator<Scrim>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.pendingScrimsSubTopic);
    }
}
