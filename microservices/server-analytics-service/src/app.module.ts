import {Module} from "@nestjs/common";
import {PostgresModule} from "@sprocketbot/common";

import {AnalyticsModule} from "./analytics/analytics.module";
import {HealthController} from "./health.controller";

@Module({
    imports: [AnalyticsModule, PostgresModule],
    controllers: [HealthController],
})
export class AppModule {}
