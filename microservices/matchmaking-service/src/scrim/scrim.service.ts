import {Injectable, Logger} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";
import type {
    Scrim, ScrimGameMode, ScrimPlayer, ScrimSettings,
} from "@sprocketbot/common";
import {
    AnalyticsEndpoint, AnalyticsService, EventTopic, ScrimStatus,
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
        protected readonly analyticsService: AnalyticsService,
    ) {}

    async createScrim(author: ScrimPlayer, settings: ScrimSettings, gameMode: ScrimGameMode, createGroup: boolean): Promise<Scrim> {
        if (await this.scrimCrudService.playerInAnyScrim(author.id)) {
            throw new RpcException("Cannot create scrim, player already in another scrim");
        }

        if (!this.scrimGroupService.modeAllowsGroups(settings.mode) && createGroup) {
            throw new RpcException("Cannot create scrim, this mode does not allow groups");
        }

        const scrim = await this.scrimCrudService.createScrim({
            settings, author, gameMode,
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
                ["submissionGroupId", scrim.submissionGroupId ?? ""],
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

            this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "scrimPopped",
                tags: [
                    ["scrimId", scrim.id],
                    ["submissionGroupId", scrim.submissionGroupId ?? ""],
                ],
            }).catch(err => { this.logger.error(err) });

            return true;
        }

        // Flush Changes
        await this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrimId);

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
        await this.eventsService.publish(EventTopic.ScrimUpdated, scrim, scrimId);
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

        const output = await this.scrimCrudService.getScrim(scrimId);
        if (output === null) throw new Error("Unexpected null scrim found");
        await this.eventsService.publish(EventTopic.ScrimUpdated, output, scrimId);
        if (output.players.every(p => p.checkedIn)) {
            // Scrim is ready to be marked as in progress
            await this.scrimLogicService.startScrim(output);
            return true;
        }
        return true;
    }

    async endScrim(scrimId: string, player: ScrimPlayer): Promise<Scrim> {
        this.logger.debug(`Attempting to end scrim, scrimId=${scrimId} playerId=${player.id}`);

        const scrim = await this.scrimCrudService.getScrim(scrimId);

        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (!scrim.players.some(p => p.id === player.id)) {
            throw new RpcException("Player not in this scrim");
        }
        if (scrim.status === ScrimStatus.RATIFYING) {
            throw new RpcException("Scrim is already ended");
        }
        if (scrim.status !== ScrimStatus.IN_PROGRESS) {
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

        return scrim;
    }

    async ratifyScrim(scrimId: string, player: ScrimPlayer): Promise<Scrim> {
        // Player will be used to track who submitted / completed a scrim
        const scrim = await this.scrimCrudService.getScrim(scrimId);
        if (!scrim) {
            throw new RpcException("Scrim not found");
        }
        if (scrim.status !== ScrimStatus.IN_PROGRESS) {
            throw new RpcException("Scrim is not in progress!");
        }
        // TODO: Override this if player / member is an admin
        if (!scrim.players.some(p => p.id === player.id)) {
            throw new RpcException("Player not in this scrim");
        }

        await this.scrimCrudService.removeScrim(scrimId);
        scrim.status = ScrimStatus.COMPLETE;
        await this.eventsService.publish(EventTopic.ScrimComplete, scrim, scrim.id);

        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "scrimRatified",
            tags: [
                ["scrimId", scrim.id],
            ],
        }).catch(err => { this.logger.error(err) });

        return scrim;
    }
}
