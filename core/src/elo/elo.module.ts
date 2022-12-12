import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {EventsModule, NotificationModule, RedisModule} from "@sprocketbot/common";

import {DatabaseModule} from "../database";
import {FranchiseModule} from "../franchise";
import {GameModule} from "../internal/game";
import {IdentityModule} from "../internal/identity";
import {OrganizationModule} from "../internal/organization";
import {CORE_WEEKLY_SALARIES_QUEUE, EloConsumer} from "./elo.consumer";
import {EloResolver} from "./elo.resolver";
import {EloService} from "./elo.service";
import {EloBullQueue} from "./elo-connector";
import {EloConnectorModule} from "./elo-connector/elo-connector.module";

@Module({
    imports: [
        BullModule.registerQueue({name: EloBullQueue}),
        BullModule.registerQueue({name: CORE_WEEKLY_SALARIES_QUEUE}),
        DatabaseModule,
        GameModule,
        OrganizationModule,
        EloConnectorModule,
        FranchiseModule,
        RedisModule,
        EventsModule,
        NotificationModule,
        IdentityModule,
    ],
    providers: [EloConsumer, EloResolver, EloService],
})
export class EloModule {}
