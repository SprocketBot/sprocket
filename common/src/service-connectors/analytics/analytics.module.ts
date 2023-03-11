import {Inject, Module} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";

import {GlobalModule} from "../../global.module";
import {CommonClient} from "../../global.types";
;
import {AnalyticsService} from "./analytics.service";

@Module({
    imports: [GlobalModule],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule {
    constructor(@Inject(CommonClient.Analytics) private analyticsClient: ClientProxy) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.analyticsClient.connect();
    }
}
