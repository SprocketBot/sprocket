import {Injectable, Logger} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";
import type {CreateScrimOptions, JoinScrimOptions, Scrim, ScrimPlayer} from "@sprocketbot/common";
import {AnalyticsEndpoint, AnalyticsService, EventTopic, MatchmakingError, ScrimStatus} from "@sprocketbot/common";
import {add} from "date-fns";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimGroupService} from "./scrim-group/scrim-group.service";
import {ScrimLogicService} from "./scrim-logic/scrim-logic.service";

@Injectable()
export class ScrimService {
    private readonly logger = new Logger(ScrimService.name);

    constructor(
        private readonly scrimCrudService: ScrimCrudService,
        private readonly eventsService: EventProxyService,
        private readonly scrimLogicService: ScrimLogicService,
        private readonly scrimGroupService: ScrimGroupService,
        private readonly analyticsService: AnalyticsService,
    ) {}

    async createScrim({
        authorUserId,
        organizationId,
        gameModeId,
        skillGroupId,
        settings,
        join,
    }: CreateScrimOptions): Promise<Scrim> {
        if (join && (await this.scrimCrudService.playerInAnyScrim(join.userId)))
            throw new RpcException(MatchmakingError.PlayerAlreadyInScrim);
        if (join?.createGroup && !this.scrimGroupService.modeAllowsGroups(settings.mode))
            throw new RpcException(MatchmakingError.ScrimGroupNotSupportedInMode);

        let player: ScrimPlayer | undefined;
        if (join)
            player = {
                userId: join.userId,
                name: join.playerName,
                joinedAt: new Date(),
                leaveAt: add(new Date(), {seconds: join.leaveAfter}),
            };

        const scrim = await this.scrimCrudService.createScrim({
            authorUserId,
            organizationId,
            gameModeId,
            skillGroupId,
            settings,
            player,
        });

        if (player && join?.createGroup) {
            const group = this.scrimGroupService.resolveGroupKey(scrim, true);
            scrim.players[0].group = group;

            await this.scrimCrudService.updatePlayer(scrim.id, Object.assign(player, {group}));
        }

        await this.eventsService.publish(EventTopic.ScrimCreated, scrim, scrim.id);

        this.analyticsService
            .send(AnalyticsEndpoint.Analytics, {
                name: "scrimCreated",
                tags: [["userId", `${authorUserId}`]],
                strings: [["scrimId", scrim.id]],
            })
            .catch(err => {
                this.logger.error(err);
            });

        return scrim;
    }

    async joinScrim({
        scrimId,
        userId,
        playerName,
        leaveAfter,
        createGroup,
        joinGroup,
    }: JoinScrimOptions): Promise<Scrim> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) throw new RpcException(MatchmakingError.ScrimNotFound);
        if (scrim.status !== ScrimStatus.PENDING) throw new RpcException(MatchmakingError.ScrimAlreadyInProgress);
        if (await this.scrimCrudService.playerInAnyScrim(userId))
            throw new RpcException(MatchmakingError.PlayerAlreadyInScrim);

        const player: ScrimPlayer = {
            userId: userId,
            name: playerName,
            joinedAt: new Date(),
            leaveAt: add(new Date(), {seconds: leaveAfter}),
            group: this.scrimGroupService.resolveGroupKey(scrim, joinGroup ?? createGroup ?? false),
        };

        await this.scrimCrudService.addPlayerToScrim(scrimId, player);
        scrim.players.push(player);

        this.analyticsService
            .send(AnalyticsEndpoint.Analytics, {
                name: "scrimJoined",
                tags: [["userId", `${player.userId}`]],
                strings: [["scrimId", scrim.id]],
            })
            .catch(err => {
                this.logger.error(err);
            });

        if (scrim.settings.teamSize * scrim.settings.teamCount === scrim.players.length) {
            await this.scrimLogicService.popScrim(scrim);
            return scrim;
        }

        // Flush changes
        await this.publishScrimUpdate(scrimId);

        return scrim;
    }

    async leaveScrim(scrimId: string, userId: number): Promise<Scrim> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) throw new RpcException(MatchmakingError.ScrimNotFound);
        if (scrim.status !== ScrimStatus.PENDING) throw new RpcException(MatchmakingError.ScrimAlreadyInProgress);
        if (!scrim.players.some(p => p.userId === userId)) throw new RpcException(MatchmakingError.PlayerNotInScrim);

        scrim.players = scrim.players.filter(p => p.userId !== userId);

        if (scrim.players.length === 0) {
            await this.scrimLogicService.deleteScrim(scrim);
            return scrim;
        }

        await this.scrimCrudService.removePlayerFromScrim(scrimId, userId);
        // Flush changes
        await this.publishScrimUpdate(scrimId);

        this.analyticsService
            .send(AnalyticsEndpoint.Analytics, {
                name: "scrimLeft",
                tags: [["userId", `${userId}`]],
                strings: [["scrimId", scrim.id]],
            })
            .catch(err => {
                this.logger.error(err);
            });

        return scrim;
    }

    async checkIn(scrimId: string, userId: number): Promise<Scrim> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) throw new RpcException(MatchmakingError.ScrimNotFound);
        if (scrim.status !== ScrimStatus.POPPED) throw new RpcException(MatchmakingError.ScrimStatusNotPopped);
        if (!scrim.players.some(p => p.userId === userId)) throw new RpcException(MatchmakingError.PlayerNotInScrim);
        if (scrim.players.find(p => p.userId === userId)!.checkedIn)
            throw new RpcException(MatchmakingError.PlayerAlreadyCheckedIn);

        const player = scrim.players.find(p => p.userId === userId)!;
        player.checkedIn = true;

        await this.scrimCrudService.updatePlayer(scrimId, player);

        const output = await this.publishScrimUpdate(scrimId);
        if (output.players.every(p => p.checkedIn)) {
            // Scrim is ready to be marked as in progress
            await this.scrimLogicService.startScrim(output);
            return scrim;
        }

        return scrim;
    }

    async cancelScrim(scrimId: string): Promise<Scrim> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) {
            throw new RpcException(MatchmakingError.ScrimNotFound);
        }

        await this.scrimCrudService.removeScrim(scrimId);
        scrim.status = ScrimStatus.CANCELLED;
        await this.eventsService.publish(EventTopic.ScrimCancelled, scrim, scrim.id);

        this.analyticsService
            .send(AnalyticsEndpoint.Analytics, {
                name: "scrimCancelled",
                strings: [["scrimId", scrim.id]],
            })
            .catch(err => {
                this.logger.error(err);
            });

        return scrim;
    }

    async completeScrim(scrimId: string, userId?: number): Promise<Scrim> {
        // Player will be used to track who submitted / completed a scrim
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) throw new RpcException(MatchmakingError.ScrimNotFound);
        if (!scrim.submissionId) throw new RpcException(MatchmakingError.ScrimSubmissionNotFound);
        // TODO: Override this if player / member is an admin
        if (userId && !scrim.players.some(p => p.userId === userId))
            throw new RpcException(MatchmakingError.PlayerNotInScrim);

        await this.scrimCrudService.removeScrim(scrimId);
        scrim.status = ScrimStatus.COMPLETE;
        await this.eventsService.publish(EventTopic.ScrimComplete, scrim, scrim.id);

        this.analyticsService
            .send(AnalyticsEndpoint.Analytics, {
                name: "scrimComplete",
                tags: [["playerId", `${userId}`]],
                strings: [["scrimId", scrim.id]],
            })
            .catch(err => {
                this.logger.error(err);
            });

        return scrim;
    }

    async setScrimLocked(scrimId: string, locked: boolean): Promise<Scrim> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) throw new RpcException(MatchmakingError.ScrimNotFound);

        if (locked) {
            if (scrim.unlockedStatus !== ScrimStatus.LOCKED)
                await this.scrimCrudService.updateScrimUnlockedStatus(scrimId, scrim.status);
            scrim.status = ScrimStatus.LOCKED;
        } else scrim.status = scrim.unlockedStatus ?? ScrimStatus.IN_PROGRESS;
        await this.scrimCrudService.updateScrimStatus(scrimId, scrim.status);

        this.analyticsService
            .send(AnalyticsEndpoint.Analytics, {
                name: `scrimLockStatusUpdated`,
                tags: [["scrimId", scrim.id]],
                booleans: [["locked", locked]],
            })
            .catch(err => {
                this.logger.error(err);
            });

        await this.publishScrimUpdate(scrimId);

        return scrim;
    }

    async publishScrimUpdate(scrimId: string): Promise<Scrim> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) throw new Error(MatchmakingError.ScrimNotFound);

        await Promise.all([
            // We don't really care about _what_ changed, in this context;
            // this is more to do with tracking how often a scrim is changed
            this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "scrimUpdated",
                strings: [["scrimId", scrimId]],
            }),
            this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrimId),
        ]);

        return scrim;
    }
}
