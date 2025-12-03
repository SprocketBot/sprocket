import {
    Inject, Logger, UseGuards,
} from "@nestjs/common";
import {
    Args, Int, Mutation, Query, Resolver, Subscription,
} from "@nestjs/graphql";
import type {
    ScrimSettings as IScrimSettings,
} from "@sprocketbot/common";
import {
    ScrimMode,
    ScrimStatus,
} from "@sprocketbot/common";
import { PubSub } from "apollo-server-express";
import { minutesToMilliseconds } from "date-fns";
import { GraphQLError } from "graphql";

import { OrganizationConfigurationService } from "../configuration";
import { OrganizationConfigurationKeyCode } from "../database";
import type { Player } from "../database/franchise/player/player.model";
import { MLE_OrganizationTeam } from "../database/mledb";
import {
    CurrentPlayer, GameSkillGroupService, PlayerService,
} from "../franchise";
import { GameModeService } from "../game";
import { CurrentUser } from "../identity";
import { UserPayload } from "../identity/auth/";
import { GqlJwtGuard } from "../identity/auth/gql-auth-guard/gql-jwt-guard";
import { MledbPlayerService } from "../mledb";
import { MLEOrganizationTeamGuard } from "../mledb/mledb-player/mle-organization-team.guard";
import { FormerPlayerScrimGuard } from "../mledb/mledb-player/mledb-player.guard";
import { QueueBanGuard } from "../organization";
import { ScrimPubSub } from "./constants";
import { CreateScrimPlayerGuard, JoinScrimPlayerGuard } from "./scrim.guard";
import { ScrimService } from "./scrim.service";
import { ScrimToggleService } from "./scrim-toggle";
import {
    CreateScrimInput, Scrim, ScrimEvent,
} from "./types";
import { ScrimMetrics } from "./types/ScrimMetrics";

@Resolver()
export class ScrimModuleResolverPublic {
    constructor(
        @Inject(ScrimPubSub) private readonly pubSub: PubSub,
        private readonly scrimService: ScrimService,
    ) { }

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
        private readonly scrimToggleService: ScrimToggleService,
        private readonly mlePlayerService: MledbPlayerService,
    ) { }

    /*
     *
     * Queries
     *
     */

    @Query(() => [Scrim])
    @UseGuards(FormerPlayerScrimGuard)
    async getAllScrims(
        @CurrentUser() user: UserPayload,
        @Args("status", {
            type: () => ScrimStatus,
            nullable: true,
        }) status?: ScrimStatus,
    ): Promise<Scrim[]> {
        if (!user.currentOrganizationId) throw new GraphQLError("Player is not connected to an organization");

        const scrims = await this.scrimService.getAllScrims();
        if (status) return scrims.filter(s => s.status === status) as Scrim[];
        return scrims.filter(s => s.organizationId === user.currentOrganizationId) as Scrim[];
    }

    @Query(() => [Scrim])
    @UseGuards(FormerPlayerScrimGuard)
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
            where: { member: { user: { id: user.userId } } },
            relations: ["member", "skillGroup"],
        });
        const scrims = await this.scrimService.getAllScrims();

        return scrims.filter(s => s.organizationId === user.currentOrganizationId
            && (!s.settings.competitive || players.some(p => s.skillGroupId === p.skillGroupId))
            && s.status === status) as Scrim[];
    }

    @Query(() => Scrim, { nullable: true })
    async getCurrentScrim(@CurrentUser() user: UserPayload): Promise<Scrim | null> {
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
        @CurrentUser() user: UserPayload,
        @Args("data") data: CreateScrimInput,
    ): Promise<Scrim> {
        if (!user.currentOrganizationId) throw new GraphQLError("User is not connected to an organization");
        if (await this.scrimToggleService.scrimsAreDisabled()) throw new GraphQLError("Scrims are disabled");

        const gameMode = await this.gameModeService.getGameModeById(data.gameModeId);
        const player = await this.playerService.getPlayerByOrganizationAndGame(user.userId, user.currentOrganizationId, gameMode.gameId);

        const mlePlayer = await this.mlePlayerService.getMlePlayerBySprocketUser(player.member.userId);
        if (mlePlayer.teamName === "FP") throw new GraphQLError("User is a former player");

        const checkinTimeout = await this.organizationConfigurationService.getOrganizationConfigurationValue<number>(user.currentOrganizationId, OrganizationConfigurationKeyCode.SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES);

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
        @CurrentUser() user: UserPayload,
        @CurrentPlayer() player: Player,
        @Args("scrimId") scrimId: string,
        @Args("leaveAfter", { type: () => Int }) leaveAfter: number,
        @Args("group", { nullable: true }) groupKey?: string,
        @Args("createGroup", { nullable: true }) createGroup?: boolean,
    ): Promise<boolean> {
        const mlePlayer = await this.mlePlayerService.getMlePlayerBySprocketUser(player.member.userId);
        if (mlePlayer.teamName === "FP") throw new GraphQLError("User is a former player");

        if (groupKey && createGroup) {
            throw new GraphQLError("You cannot join a group and create a group. Please provide either group or createGroup, not both.");
        }
        const group = groupKey ?? createGroup ?? undefined;

        const scrim = await this.scrimService.getScrimById(scrimId).catch(() => null);
        if (!scrim) throw new GraphQLError("Scrim does not exist");

        if (group && scrim.settings.mode === ScrimMode.ROUND_ROBIN) {
            throw new GraphQLError("You cannot create or join a group for a Round Robin scrim");
        }

        if (scrim.settings.competitive && player.skillGroupId !== scrim.skillGroupId) throw new GraphQLError("Player is not in the correct skill group");

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
    async leaveScrim(@CurrentUser() user: UserPayload): Promise<boolean> {
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) throw new GraphQLError("You must be in a scrim to leave");

        return this.scrimService.leaveScrim(user.userId, scrim.id);
    }

    @Mutation(() => Boolean)
    async checkInToScrim(@CurrentUser() user: UserPayload): Promise<boolean> {
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
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async lockScrim(@Args("scrimId") scrimId: string): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, true);
    }

    @Mutation(() => Boolean)
    @UseGuards(GqlJwtGuard, MLEOrganizationTeamGuard(MLE_OrganizationTeam.MLEDB_ADMIN))
    async unlockScrim(@Args("scrimId") scrimId: string): Promise<boolean> {
        return this.scrimService.setScrimLocked(scrimId, false);
    }

    /*
     *
     * Subscriptions
     *
     */

    @Subscription(() => ScrimEvent)
    async followCurrentScrim(@CurrentUser() user: UserPayload): Promise<AsyncIterator<ScrimEvent> | undefined> {
        await this.scrimService.enableSubscription();
        const scrim = await this.scrimService.getScrimByPlayer(user.userId);
        if (!scrim) return undefined;
        return this.pubSub.asyncIterator(scrim.id);
    }

    @Subscription(() => Scrim, {
        async filter(this: ScrimModuleResolver, payload: { followPendingScrims: Scrim; }, variables, context: { req: { user: UserPayload; }; }) {
            const { userId, currentOrganizationId } = context.req.user;
            if (!currentOrganizationId) return false;

            const { id: gameModeId } = payload.followPendingScrims.gameMode;
            const player = await this.playerService.getPlayerByOrganizationAndGameMode(userId, currentOrganizationId, gameModeId);

            return player.skillGroupId === payload.followPendingScrims.skillGroupId || !payload.followPendingScrims.settings.competitive;
        },
    })
    async followPendingScrims(): Promise<AsyncIterator<Scrim>> {
        await this.scrimService.enableSubscription();
        return this.pubSub.asyncIterator(this.scrimService.pendingScrimsSubTopic);
    }
}
