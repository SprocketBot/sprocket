import {Module} from "@nestjs/common";
import {AnalyticsModule, EventsModule, RedisModule} from "@sprocketbot/common";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {GameOrderService} from "./game-order/game-order.service";
import {ScrimController} from "./scrim.controller";
import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimGroupService} from "./scrim-group/scrim-group.service";
import {ScrimLogicService} from "./scrim-logic/scrim-logic.service";
import {ScrimMetricsService} from "./scrim-metrics/scrim-metrics.service";

@Module({
    imports: [RedisModule, EventsModule, AnalyticsModule],
    controllers: [ScrimController],
    providers: [
        ScrimCrudService,
        ScrimService,
        ScrimLogicService,
        EventProxyService,
        ScrimMetricsService,
        ScrimGroupService,
        GameOrderService
    ],
})
export class ScrimModule {}
