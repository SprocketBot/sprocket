import {Controller, Logger} from "@nestjs/common";
import {MessagePattern, RpcException} from "@nestjs/microservices";

import {serverEventSchema} from "./analytics.schema";
import {AnalyticsService} from "./analytics.service";

@Controller()
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(private analyticsService: AnalyticsService) {}

    @MessagePattern("analytics")
    async track(data: unknown): Promise<void> {
        try {
            const result = serverEventSchema.parse(data);
            this.analyticsService.createPoint(result);
            this.logger.debug("Logged point", {data});
        } catch (e) {
            this.logger.error("Error logging point", {data}, e);
            throw new RpcException(e as Error);
        }
    }
}
