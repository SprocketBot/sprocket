import {Global, Module} from "@nestjs/common";
import {
    AnalyticsModule, AnalyticsService,
} from "@sprocketbot/common";

@Global()
@Module({
    imports: [AnalyticsModule],
    providers: [AnalyticsService],
    exports: [AnalyticsModule],
})
export class GlobalModule { }
