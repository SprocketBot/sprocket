import {Module} from "@nestjs/common";
import {
    AnalyticsModule,
    EventsModule,
    PostgresModule,
    SubmissionModule,
} from "@sprocketbot/common";

import {EventProxyService} from "./event-proxy/event-proxy.service";
import {GameOrderService} from "./game-order/game-order.service";
import {ScrimPostgresRepository} from "./persistence/scrim-postgres.repository";
import {ScrimConsumer} from "./scrim.consumer";
import {ScrimController} from "./scrim.controller";
import {ScrimEventSubscriber} from "./scrim.event-subscriber";
import {ScrimService} from "./scrim.service";
import {ScrimCrudService} from "./scrim-crud/scrim-crud.service";
import {ScrimGroupService} from "./scrim-group/scrim-group.service";
import {ScrimLogicService} from "./scrim-logic/scrim-logic.service";
import {ScrimMetricsService} from "./scrim-metrics/scrim-metrics.service";

@Module({
    imports: [
        PostgresModule,
        EventsModule,
        AnalyticsModule,
        SubmissionModule,
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
        ScrimPostgresRepository,
    ],
    exports: [ScrimCrudService, EventProxyService, ScrimLogicService, ScrimGroupService],
})
export class ScrimModule {}
