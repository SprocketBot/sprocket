import {Module} from "@nestjs/common";
import {
    AnalyticsModule,
    EventsModule,
    NotificationModule,
    PostgresModule,
    RedisModule,
} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../game";
import {IdentityModule} from "../identity";
import {OrganizationModule} from "../organization";
import {EloConsumer} from "./elo.consumer";
import {EloResolver} from "./elo.resolver";
import {EloService} from "./elo.service";
import {EloConnectorModule} from "./elo-connector/elo-connector.module";

@Module({
    imports: [
        DatabaseModule,
        GameModule,
        OrganizationModule,
        EloConnectorModule,
        FranchiseModule,
        RedisModule,
        EventsModule,
        NotificationModule,
        IdentityModule,
        AnalyticsModule,
        PostgresModule,
    ],
    providers: [EloConsumer, EloResolver, EloService],
})
export class EloModule {}
