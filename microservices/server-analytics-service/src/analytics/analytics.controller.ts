import {Controller, Logger} from "@nestjs/common";
import {MessagePattern, Payload, RpcException} from "@nestjs/microservices";
import type {AnalyticsOutput} from "@sprocketbot/common";
import {AnalyticsEndpoint} from "@sprocketbot/common";

import {AnalyticsPointSchema} from "./analytics.schema";
import {AnalyticsService} from "./analytics.service";

@Controller()
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(private analyticsService: AnalyticsService) {}

    @MessagePattern(AnalyticsEndpoint.Analytics)
    async track(@Payload() data: unknown): Promise<AnalyticsOutput<AnalyticsEndpoint.Analytics>> {
        try {
            const result = AnalyticsPointSchema.parse(data);
            this.analyticsService.createPoint(result);
            this.logger.debug("Logged point", {data});

            return true;
        } catch (e) {
            this.logger.error("Error logging point", {data}, e);
            throw new RpcException(e as Error);
        }
    }
}
