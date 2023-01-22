import {Controller} from "@nestjs/common";
import {MessagePattern, Payload, RpcException} from "@nestjs/microservices";
import type {Scrim, ScrimMetrics} from "@sprocketbot/common";
import {MatchmakingEndpoint, MatchmakingError, MatchmakingSchemas} from "@sprocketbot/common";

import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimMetricsService} from "./scrim-metrics/scrim-metrics.service";

@Controller("scrim")
export class ScrimController {
    constructor(
        private readonly scrimCrudService: ScrimCrudService,
        private readonly scrimService: ScrimService,
        private readonly scrimMetricsService: ScrimMetricsService,
    ) {}

    @MessagePattern(MatchmakingEndpoint.CreateScrim)
    async createScrim(@Payload() payload: unknown): Promise<Scrim> {
        const data = MatchmakingSchemas.CreateScrim.input.parse(payload);
        return this.scrimService.createScrim(data);
    }

    @MessagePattern(MatchmakingEndpoint.GetAllScrims)
    async getAllScrims(@Payload() payload: unknown): Promise<Scrim[]> {
        const data = MatchmakingSchemas.GetAllScrims.input.parse(payload);
        return this.scrimCrudService.getAllScrims(data.organizationId, data.skillGroupIds);
    }

    @MessagePattern(MatchmakingEndpoint.GetScrim)
    async getScrim(@Payload() payload: unknown): Promise<Scrim> {
        const data = MatchmakingSchemas.GetScrim.input.parse(payload);
        const scrim = await this.scrimCrudService.getScrim(data.scrimId);

        if (!scrim) throw new RpcException(MatchmakingError.ScrimNotFound);
        return scrim;
    }

    @MessagePattern(MatchmakingEndpoint.JoinScrim)
    async joinScrim(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.JoinScrim.input.parse(payload);
        await this.scrimService.joinScrim(data);
        return true;
    }

    @MessagePattern(MatchmakingEndpoint.LeaveScrim)
    async leaveScrim(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.LeaveScrim.input.parse(payload);
        await this.scrimService.leaveScrim(data.scrimId, data.userId);
        return true;
    }

    @MessagePattern(MatchmakingEndpoint.CheckInToScrim)
    async checkIn(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.CheckInToScrim.input.parse(payload);
        await this.scrimService.checkIn(data.scrimId, data.userId);
        return true;
    }

    @MessagePattern(MatchmakingEndpoint.CancelScrim)
    async cancelScrim(@Payload() payload: unknown): Promise<Scrim> {
        const data = MatchmakingSchemas.CancelScrim.input.parse(payload);
        return this.scrimService.cancelScrim(data.scrimId, data.reason);
    }

    @MessagePattern(MatchmakingEndpoint.GetScrimMetrics)
    async getScrimMetrics(): Promise<ScrimMetrics> {
        return this.scrimMetricsService.getScrimMetrics();
    }

    @MessagePattern(MatchmakingEndpoint.GetScrimByPlayer)
    async getScrimByPlayer(@Payload() payload: unknown): Promise<Scrim | null> {
        const data = MatchmakingSchemas.GetScrimByPlayer.input.parse(payload);
        return this.scrimCrudService.getScrimByPlayer(data.userId);
    }

    @MessagePattern(MatchmakingEndpoint.GetScrimBySubmissionId)
    async getScrimBySubmissionId(@Payload() payload: unknown): Promise<Scrim> {
        const data = MatchmakingSchemas.GetScrimBySubmissionId.input.parse(payload);
        const result = await this.scrimCrudService.getScrimBySubmissionId(data.submissionId);

        if (!result) throw new RpcException(MatchmakingError.ScrimSubmissionNotFound);
        return result;
    }

    @MessagePattern(MatchmakingEndpoint.CompleteScrim)
    async completeScrim(@Payload() payload: unknown): Promise<Scrim | null> {
        const data = MatchmakingSchemas.CompleteScrim.input.parse(payload);
        return this.scrimService.completeScrim(data.scrimId, data.userId);
    }

    @MessagePattern(MatchmakingEndpoint.SetScrimLocked)
    async setScrimLocked(@Payload() payload: unknown): Promise<boolean> {
        const data = MatchmakingSchemas.SetScrimLocked.input.parse(payload);

        if (data.locked) await this.scrimService.setScrimLocked(data.scrimId, data.locked, data.reason);
        else await this.scrimService.setScrimLocked(data.scrimId, data.locked);

        return true;
    }
}
