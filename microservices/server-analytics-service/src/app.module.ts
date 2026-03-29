import {Module} from "@nestjs/common";

import {AnalyticsModule} from "./analytics/analytics.module";
import {HealthController} from "./health.controller";

@Module({
    imports: [AnalyticsModule],
    controllers: [HealthController],
})
export class AppModule {}
