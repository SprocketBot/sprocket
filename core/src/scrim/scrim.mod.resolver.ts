import {
    Inject, Logger, UseGuards,
} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import type {
    ScrimPlayer as IScrimPlayer,
    ScrimSettings as IScrimSettings,
} from "@sprocketbot/common";
import {ScrimStatus} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";
import {GraphQLError} from "graphql";

import {OrganizationConfigurationService} from "../configuration/organization-configuration/organization-configuration.service";
import {Player} from "../database";
import {CurrentPlayer} from "../franchise";
import {GameSkillGroupService} from "../franchise/game-skill-group";
import {GameModeService} from "../game/game-mode/game-mode.service";
import {CurrentUser} from "../identity/auth/current-user.decorator";
import {GqlJwtGuard} from "../identity/auth/gql-auth-guard/gql-jwt-guard";
import {UserPayload} from "../identity/auth/oauth/types/userpayload.type";
import {QueueBanGuard} from "../organization/member-restriction";
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
        @Args("status", {
            type: () => ScrimStatus,
            nullable: true,
        }) status?: ScrimStatus,
        @Args("skillGroupId", {
            nullable: true,
            type: () => Int,
        }) skillGroupId?: number,
    ): Promise<Scrim[]> {
        const scrims = await this.scrimService.getAllScrims(skillGroupId);
        if (status) return scrims.filter(s => s.status === status) as Scrim[];
        return scrims as Scrim[];
    }

    @Query(() => Scrim, {nullable: true})
    async getCurrentScrim(@CurrentUser() user: UserPayload): Promise<Scrim | null> {
        const result = await this.scrimService.getScrimByPlayer(user.userId);
        if (result) return new Scrim(result);
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
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(data.settings.skillGroupId);
        const checkinTimeout = await this.organizationConfigurationService.getOrganizationConfigurationValue(user.currentOrganizationId, "scrimQueueCheckinTimeout");
        const settings: IScrimSettings = {
            competitive: data.settings.competitive,
            skillGroupId: skillGroup.id,
            mode: data.settings.mode,
            teamSize: gameMode.teamSize,
            teamCount: gameMode.teamCount,
            checkinTimeout: parseInt(checkinTimeout.value),
        };

        return this.scrimService.createScrim(
            user.currentOrganizationId,
            this.userToScrimPlayer(user),
            settings,
            {
                id: gameMode.id,
                description: gameMode.description,
            },
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
        
        if (player.skillGroupId !== scrim.settings.skillGroupId) throw new GraphQLError("Player is not in the correct skill group");

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
