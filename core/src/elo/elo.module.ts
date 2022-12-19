import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {EventsModule, NotificationModule, RedisModule} from "@sprocketbot/common";

import {FranchiseModule} from "../franchise/franchise.module";
import {GameModule} from "../game/game.module";
import {IdentityModule} from "../identity/identity.module";
import {OrganizationModule} from "../organization/organization.module";
import {CORE_WEEKLY_SALARIES_QUEUE, EloConsumer} from "./elo.consumer";
import {EloResolver} from "./elo.resolver";
import {EloService} from "./elo.service";
import {EloBullQueue} from "./elo-connector";
import {EloConnectorModule} from "./elo-connector/elo-connector.module";

@Module({
    imports: [
        BullModule.registerQueue({name: EloBullQueue}),
        BullModule.registerQueue({name: CORE_WEEKLY_SALARIES_QUEUE}),
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
