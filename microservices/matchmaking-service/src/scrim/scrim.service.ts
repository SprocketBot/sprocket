import {Injectable, Logger} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";
import type {
    Scrim, ScrimGameMode, ScrimPlayer, ScrimSettings,
} from "@sprocketbot/common";
import {
    AnalyticsEndpoint,
    AnalyticsService,
    EventTopic,
    ScrimStatus,
} from "@sprocketbot/common";

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

    async createScrim(organizationId: number, author: ScrimPlayer, settings: ScrimSettings, gameMode: ScrimGameMode, skillGroupId: number, createGroup: boolean): Promise<Scrim> {
        if (await this.scrimCrudService.playerInAnyScrim(author.id)) {
            throw new RpcException("Cannot create scrim, player already in another scrim");
        }

        if (!this.scrimGroupService.modeAllowsGroups(settings.mode) && createGroup) {
            throw new RpcException("Cannot create scrim, this mode does not allow groups");
        }

        const scrim = await this.scrimCrudService.createScrim({
            organizationId, settings, author, gameMode, skillGroupId,
        });

        if (createGroup) {
            const group = this.scrimGroupService.resolveGroupKey(scrim, true);
            scrim.players[0].group = group;
            await this.scrimCrudService.updatePlayer(scrim.id, {...author, group});
        }

        await this.eventsService.publish(EventTopic.ScrimCreated, scrim, scrim.id);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimCreated",
            tags: [
                ["scrimId", scrim.id],
                ["submissionId", scrim.submissionId ?? ""],
                ["authorId", `${author.id}`],
            ],
        }).catch(err => { this.logger.error(err) });

        return scrim;
    }

    async joinScrim(scrimId: string, player: ScrimPlayer, groupKey: boolean | string | undefined): Promise<boolean> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (scrim.status !== ScrimStatus.PENDING) {
            throw new RpcException("Scrim already in progress");
        }
        if (await this.scrimCrudService.playerInAnyScrim(player.id)) {
            throw new RpcException("Player already in scrim");
        }

        // eslint-disable-next-line require-atomic-updates
        player.group = this.scrimGroupService.resolveGroupKey(scrim, groupKey ?? false);

        await this.scrimCrudService.addPlayerToScrim(scrimId, player);
        scrim.players.push(player);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimJoined",
            tags: [
                ["scrimId", scrim.id],
                ["playerId", `${player.id}`],
            ],
        }).catch(err => { this.logger.error(err) });

        if (scrim.settings.teamSize * scrim.settings.teamCount === scrim.players.length) {
            await this.scrimLogicService.popScrim(scrim);
            return true;
        }

        // Flush Changes
        await this.publishScrimUpdate(scrimId);

        return true;
    }

    async leaveScrim(scrimId: string, player: ScrimPlayer): Promise<boolean> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (scrim.status !== ScrimStatus.PENDING) {
            throw new RpcException("Scrim already in progress");
        }
        if (!scrim.players.some(p => p.id === player.id)) {
            throw new RpcException("Player not in this scrim");
        }
        scrim.players = scrim.players.filter(p => p.id !== player.id);

        if (scrim.players.length === 0) {
            await this.scrimLogicService.deleteScrim(scrim);
            return true;
        }

        await this.scrimCrudService.removePlayerFromScrim(scrimId, player);
        await this.publishScrimUpdate(scrimId);
        // refetch it

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimLeft",
            tags: [
                ["scrimId", scrim.id],
                ["playerId", `${player.id}`],
            ],
        }).catch(err => { this.logger.error(err) });

        return true;
    }

    async checkIn(scrimId: string, player: ScrimPlayer): Promise<boolean> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (scrim.status !== ScrimStatus.POPPED) {
            throw new RpcException("Scrim is not ready to be checked in to");
        }
        if (!scrim.players.some(p => p.id === player.id)) {
            throw new RpcException("Player not in this scrim");
        }
        if (scrim.players.find(p => p.id === player.id)!.checkedIn) {
            throw new RpcException("Player is already checked in");
        }

        player.checkedIn = true;
        await this.scrimCrudService.updatePlayer(scrimId, player);

        const output = await this.publishScrimUpdate(scrimId);
        if (output.players.every(p => p.checkedIn)) {
            // Scrim is ready to be marked as in progress
            await this.scrimLogicService.startScrim(output);
            return true;
        }
        return true;
    }

    async cancelScrim(scrimId: string): Promise<Scrim> {
        this.logger.debug(`Attempting to cancel scrim, scrimId=${scrimId}`);

        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) {
            throw new RpcException("Scrim not found");
        }

        await this.scrimCrudService.removeScrim(scrimId);
        scrim.status = ScrimStatus.CANCELLED;
        await this.eventsService.publish(EventTopic.ScrimCancelled, scrim, scrim.id);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimCancelled",
            tags: [
                ["scrimId", scrim.id],
            ],
        }).catch(err => { this.logger.error(err) });

        return scrim;
    }

    async moveToRatification(scrimId: string): Promise<boolean> {
        this.logger.debug(`Beginning to ratify scrim, scrimId=${scrimId}`);

        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (scrim.status === ScrimStatus.RATIFYING) {
            throw new RpcException("Scrim is already ended");
        }
        if (scrim.status !== ScrimStatus.SUBMITTING) {
            throw new RpcException("Scrim is not ready to be ended");
        }

        scrim.status = ScrimStatus.RATIFYING;
        await this.scrimCrudService.updateScrimStatus(scrimId, scrim.status);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimRatifying",
            tags: [
                ["scrimId", scrim.id],
            ],
        }).catch(err => { this.logger.error(err) });

        await this.publishScrimUpdate(scrimId);

        return true;
    }

    async resetScrim(scrimId: string, playerId?: number): Promise<boolean> {
        this.logger.debug(`Attempting to reset scrim, scrimId=${scrimId} playerId=${playerId}`);

        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (playerId && !scrim.players.some(p => p.id === playerId)) {
            throw new RpcException("Player not in this scrim");
        }
        if (scrim.status !== ScrimStatus.RATIFYING && scrim.status !== ScrimStatus.SUBMITTING) {
            throw new RpcException("Scrim is not RATIFYING, can't be reset");
        }

        scrim.status = ScrimStatus.IN_PROGRESS;
        await this.scrimCrudService.updateScrimStatus(scrimId, scrim.status);

        await this.publishScrimUpdate(scrimId);

        return true;
    }

    async completeScrim(scrimId: string, playerId?: number): Promise<Scrim> {
        // Player will be used to track who submitted / completed a scrim
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (!scrim.submissionId) throw new RpcException("Scrim does not yet have a submission, cannot complete.");

        // TODO: Override this if player / member is an admin
        if (playerId && !scrim.players.some(p => p.id === playerId)) {
            throw new RpcException("Player not in this scrim");
        }

        await this.scrimCrudService.removeScrim(scrimId);
        scrim.status = ScrimStatus.COMPLETE;
        await this.eventsService.publish(EventTopic.ScrimComplete, scrim, scrim.id);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimComplete",
            tags: [
                ["scrimId", scrim.id],
            ],
        }).catch(err => { this.logger.error(err) });

        return scrim;
    }

    async forceUpdateScrimStatus(scrimId: string, status: ScrimStatus): Promise<void> {
        await this.scrimCrudService.updateScrimStatus(scrimId, status);
        await this.publishScrimUpdate(scrimId);
    }

    async setScrimLocked(scrimId: string, locked: boolean): Promise<boolean> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) {
            throw new RpcException("Scrim not found");
        }

        if (locked) {
            if (scrim.unlockedStatus !== ScrimStatus.LOCKED) await this.scrimCrudService.updateScrimUnlockedStatus(scrimId, scrim.status);
            scrim.status = ScrimStatus.LOCKED;
        } else scrim.status = scrim.unlockedStatus ?? ScrimStatus.IN_PROGRESS;
        await this.scrimCrudService.updateScrimStatus(scrimId, scrim.status);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: `scrimLockStatusUpdated`,
            tags: [
                ["scrimId", scrim.id],
                ["status", locked ? "locked" : "unlocked"],
            ],
        }).catch(err => { this.logger.error(err) });

        await this.publishScrimUpdate(scrimId);

        return true;
    }

    private async publishScrimUpdate(scrimId: string): Promise<Scrim> {
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) throw new Error("Unexpected null scrim found");
        await Promise.all([
            // We don't really care about _what_ changed, in this context;
            // this is more to do with tracking how often a scrim is changed
            this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "ScrimUpdated",
                strings: [ ["scrimId", scrimId] ],
            }),
            this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrimId),
        ]);
        return scrim;
    }
}
