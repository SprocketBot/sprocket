import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import type {Scrim, ScrimMetrics} from "@sprocketbot/common";
import {MatchmakingEndpoint, MatchmakingSchemas} from "@sprocketbot/common";

import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimMetricsService} from "./scrim-metrics/scrim-metrics.service";

@Controller("scrim")
export class ScrimController {
    constructor(
        private readonly scrimCrudService: ScrimCrudService,
        private readonly scrimService: ScrimService,
        private readonly scrimMetricsService: ScrimMetricsService,
    ) {
    }

    @MessagePattern(MatchmakingEndpoint.CreateScrim)
    async createScrim(@Payload() payload: unknown): Promise<Scrim> {
        const data = MatchmakingSchemas.CreateScrim.input.parse(payload);
        return this.scrimService.createScrim(data.organizationId, data.author, data.settings, data.gameMode, data.skillGroupId, data.createGroup);
    }

    @MessagePattern(MatchmakingEndpoint.GetAllScrims)
    async getAllScrims(@Payload() payload: unknown): Promise<Scrim[]> {
        const data = MatchmakingSchemas.GetAllScrims.input.parse(payload);
        return this.scrimCrudService.getAllScrims(data.skillGroupId);
    }

    @MessagePattern(MatchmakingEndpoint.GetScrim)
    async getScrim(@Payload() payload: unknown): Promise<Scrim> {
        const data = MatchmakingSchemas.GetScrim.input.parse(payload);
        const scrim = await this.scrimCrudService.getScrim(data);
        if (scrim) return scrim;
        throw new Error("Not Found!");
    }

    @MessagePattern(MatchmakingEndpoint.JoinScrim)
    async joinScrim(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.JoinScrim.input.parse(payload);
        return this.scrimService.joinScrim(data.scrimId, data.player, data.group);
    }

    @MessagePattern(MatchmakingEndpoint.LeaveScrim)
    async leaveScrim(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.LeaveScrim.input.parse(payload);
        return this.scrimService.leaveScrim(data.scrimId, data.player);
    }

    @MessagePattern(MatchmakingEndpoint.CheckInToScrim)
    async checkIn(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.CheckInToScrim.input.parse(payload);
        return this.scrimService.checkIn(data.scrimId, data.player);
    }

    @MessagePattern(MatchmakingEndpoint.EndScrim)
    async endScrim(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.EndScrim.input.parse(payload);
        return this.scrimService.endScrim(data.scrimId, data.player);
    }

    @MessagePattern(MatchmakingEndpoint.CancelScrim)
    async cancelScrim(@Payload() payload: unknown): Promise<Scrim> {
        const data = MatchmakingSchemas.CancelScrim.input.parse(payload);
        return this.scrimService.cancelScrim(data.scrimId);
    }

    @MessagePattern(MatchmakingEndpoint.GetScrimMetrics)
    async getScrimMetrics(): Promise<ScrimMetrics> {
        return this.scrimMetricsService.getScrimMetrics();
    }

    @MessagePattern(MatchmakingEndpoint.GetScrimByPlayer)
    async getScrimByPlayer(@Payload() payload: unknown): Promise<Scrim | null> {
        const data = MatchmakingSchemas.GetScrimByPlayer.input.parse(payload);
        return this.scrimCrudService.getScrimByPlayer(data);
    }

    @MessagePattern(MatchmakingEndpoint.GetScrimBySubmissionId)
    async getScrimBySubmissionId(@Payload() payload: unknown): Promise<Scrim | null> {
        const data = MatchmakingSchemas.GetScrimBySubmissionId.input.parse(payload);
        return this.scrimCrudService.getScrimBySubmissionId(data);
    }

    @MessagePattern(MatchmakingEndpoint.CompleteScrim)
    async completeScrim(@Payload() payload: unknown): Promise<Scrim | null> {
        const data = MatchmakingSchemas.CompleteScrim.input.parse(payload);
        return this.scrimService.completeScrim(data.scrimId, data.playerId);
    }

    @MessagePattern(MatchmakingEndpoint.ForceUpdateScrimStatus)
    async complete(@Payload() payload: unknown): Promise<boolean | null> {
        const data = MatchmakingSchemas.ForceUpdateScrimStatus.input.parse(payload);
        await this.scrimService.forceUpdateScrimStatus(data.scrimId, data.status);
        return true;
    }

    @MessagePattern(MatchmakingEndpoint.SetScrimLocked)
    async setScrimLocked(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.SetScrimLocked.input.parse(payload);
        await this.scrimService.setScrimLocked(data.scrimId, data.locked);
        return true;
    }

}
