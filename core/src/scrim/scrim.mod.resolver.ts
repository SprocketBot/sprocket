import {
    Inject, Logger, UseGuards,
} from "@nestjs/common";
import {
    Args, Mutation, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import type {
    ScrimPlayer as IScrimPlayer,
    ScrimSettings as IScrimSettings,
} from "@sprocketbot/common";
import {ScrimStatus} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {GraphQLError} from "graphql";

import {OrganizationConfigurationService} from "../configuration";
import {OrganizationConfigurationKeyCode, Player} from "../database";
import {
    CurrentPlayer, GameSkillGroupService, PlayerService,
} from "../franchise";
import {GameModeService} from "../game";
import {CurrentUser} from "../identity";
import {UserPayload} from "../identity/auth/";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard/gql-jwt-guard";
import {QueueBanGuard} from "../organization";
import {ScrimPubSub} from "./constants";
import {CreateScrimPlayerGuard, JoinScrimPlayerGuard} from "./scrim.guard";
import {ScrimService} from "./scrim.service";
import {
    CreateScrimInput, Scrim, ScrimEvent,
} from "./types";
import {ScrimMetrics} from "./types/ScrimMetrics";

@Resolver()
export class ScrimModuleResolverPublic {
    constructor(
        private readonly scrimService: ScrimService,
        @Inject(ScrimPubSub) private readonly pubSub: PubSub,
        private readonly gameModeService: GameModeService,
    ) {}

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
@UseGuards(GqlJwtGuard)
export class ScrimModuleResolver {
    private readonly logger = new Logger(ScrimModuleResolver.name);

    constructor(
        @Inject(ScrimPubSub) private readonly pubSub: PubSub,
        private readonly playerService: PlayerService,
        private readonly scrimService: ScrimService,
        private readonly gameModeService: GameModeService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly organizationConfigurationService: OrganizationConfigurationService,
    ) {}

    /*
     *
     * Queries
     *
     */

    @Query(() => [Scrim])
    async getAllScrims(
        @CurrentUser() user: UserPayload,
        @Args("status", {
            type: () => ScrimStatus,
            nullable: true,
        }) status?: ScrimStatus,
    ): Promise<Scrim[]> {
        if (!user.currentOrganizationId) throw new GraphQLError("User is not connected to an organiazation");

        const scrims = await this.scrimService.getAllScrims();
        if (status) return scrims.filter(s => s.status === status) as Scrim[];
        return scrims.filter(s => s.organizationId === user.currentOrganizationId) as Scrim[];
    }

    @Query(() => [Scrim])
    async getAvailableScrims(
        @CurrentUser() user: UserPayload,
        @Args("status", {
            type: () => ScrimStatus,
            nullable: true,
            defaultValue: ScrimStatus.PENDING,
        }) status: ScrimStatus = ScrimStatus.PENDING,
    ): Promise<Scrim[]> {
        if (!user.currentOrganizationId) throw new GraphQLError("User is not connected to an organiazation");

        const players = await this.playerService.getPlayers({
            where: {member: {user: {id: user.userId} } },
            relations: ["member", "skillGroup"],
        });
        const scrims = await this.scrimService.getAllScrims();

        return scrims.filter(s => s.organizationId === user.currentOrganizationId
            && players.some(p => s.skillGroupId === p.skillGroupId)
            && s.status === status) as Scrim[];
    }

    @Query(() => Scrim, {nullable: true})
    async getCurrentScrim(@CurrentUser() user: UserPayload): Promise<Scrim | null> {
        const result = await this.scrimService.getScrimByPlayer(user.userId);
        if (result) return result as Scrim;
        return null;
    }

    /*
     *
     * Mutations
     *
     */

    @Mutation(() => Scrim)
    @UseGuards(QueueBanGuard, CreateScrimPlayerGuard)
    async createScrim(
        @CurrentUser() user: UserPayload,
        @Args("data") data: CreateScrimInput,
        @Args("createGroup", {nullable: true}) createGroup?: boolean,
    ): Promise<Scrim> {
        if (!user.currentOrganizationId) throw new GraphQLError("User is not connected to an organization");

        const gameMode = await this.gameModeService.getGameModeById(data.settings.gameModeId);
        const player = await this.playerService.getPlayerByOrganizationAndGame(user.userId, user.currentOrganizationId, gameMode.gameId);
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(player.skillGroupId);
        const checkinTimeout = await this.organizationConfigurationService.getOrganizationConfigurationValue(user.currentOrganizationId, OrganizationConfigurationKeyCode.SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES);
        const settings: IScrimSettings = {
            competitive: data.settings.competitive,
            mode: data.settings.mode,
            teamSize: gameMode.teamSize,
            teamCount: gameMode.teamCount,
            observable: data.settings.observable,
            checkinTimeout: parseFloat(checkinTimeout) * 60 * 1000,
        };

        return this.scrimService.createScrim(
            user.currentOrganizationId,
            this.userToScrimPlayer(user),
            settings,
            {
                id: gameMode.id,
                description: gameMode.description,
            },
            skillGroup.id,
            createGroup,
        ) as Promise<Scrim>;
    }

    @Mutation(() => Boolean)
    @UseGuards(QueueBanGuard, JoinScrimPlayerGuard)
    async joinScrim(
        @CurrentUser() user: UserPayload,
        @CurrentPlayer() player: Player,
        @Args("scrimId") scrimId: string,
        @Args("group", {nullable: true}) groupKey?: string,
        @Args("createGroup", {nullable: true}) createGroup?: boolean,
    ): Promise<boolean> {
        if (groupKey && createGroup) {
            throw new GraphQLError("You cannot join a group and create a group. Please provide either group or createGroup, not both.");
        }
        const group = groupKey ?? createGroup ?? undefined;

        const scrim = await this.scrimService.getScrimById(scrimId).catch(() => null);
        if (!scrim) throw new GraphQLError("Scrim does not exist");

        if (player.skillGroupId !== scrim.skillGroupId) throw new GraphQLError("Player is not in the correct skill group");

        return this.scrimService.joinScrim(this.userToScrimPlayer(user), scrimId, group);
    }

    @Mutation(() => Boolean)
    async leaveScrim(@CurrentUser() user: UserPayload): Promise<boolean> {
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) throw new GraphQLError("You must be in a scrim to leave");

        return this.scrimService.leaveScrim(this.userToScrimPlayer(user), scrim.id);
    }

    @Mutation(() => Boolean)
    async checkInToScrim(@CurrentUser() user: UserPayload): Promise<boolean> {
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) throw new GraphQLError("You must be in a scrim to check in");

        return this.scrimService.checkIn(this.userToScrimPlayer(user), scrim.id);
    }

    @Mutation(() => Scrim)
    async cancelScrim(@Args("scrimId") scrimId: string): Promise<Scrim> {
        return this.scrimService.cancelScrim(scrimId) as Promise<Scrim>;
    }

    @Mutation(() => Boolean)
    async lockScrim(@Args("scrimId") scrimId: string): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, true);
    }

    @Mutation(() => Boolean)
    async unlockScrim(@Args("scrimId") scrimId: string): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, false);
    }

    /*
     *
     * Subscriptions
     *
     */

    @Subscription(() => ScrimEvent)
    async followCurrentScrim(@CurrentUser() user: UserPayload): Promise<AsyncIterator<ScrimEvent>> {
        await this.scrimService.enableSubscription();
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) throw new GraphQLError("You must be in a scrim to subscribe to updates");
        return this.pubSub.asyncIterator(scrim.id);
    }

    @Subscription(() => Scrim)
    async followPendingScrims(): Promise<AsyncIterator<Scrim>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.pendingScrimsSubTopic);
    }

    private userToScrimPlayer = (u: UserPayload): IScrimPlayer => ({id: u.userId, name: u.username});
}
