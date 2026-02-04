import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {
    AnalyticsModule,
    EventsModule,
    RedisModule,
    SubmissionModule,
} from "@sprocketbot/common";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {GameOrderService} from "./game-order/game-order.service";
import {MATCHMAKING_QUEUE, ScrimConsumer} from "./scrim.consumer";
import {ScrimController} from "./scrim.controller";
import {ScrimEventSubscriber} from "./scrim.event-subscriber";
import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimGroupService} from "./scrim-group/scrim-group.service";
import {ScrimLogicService} from "./scrim-logic/scrim-logic.service";
import {ScrimMetricsService} from "./scrim-metrics/scrim-metrics.service";

@Module({
    imports: [
        RedisModule,
        EventsModule,
        AnalyticsModule,
        SubmissionModule,
        // BullModule.forRoot() removed - now configured in MonolithModule
        BullModule.registerQueue({name: "scrim"}),
        BullModule.registerQueue({name: MATCHMAKING_QUEUE}),
    ],
    controllers: [ScrimController],
    providers: [
        ScrimConsumer,
        ScrimCrudService,
        ScrimService,
        ScrimLogicService,
        EventProxyService,
        ScrimMetricsService,
        ScrimGroupService,
        GameOrderService,
        ScrimEventSubscriber,
    ],
    exports: [ScrimCrudService, EventProxyService, ScrimLogicService, ScrimGroupService],
})
export class ScrimModule {}
